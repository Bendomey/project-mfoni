import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequestHandler } from '@remix-run/express'
import { type ServerBuild } from '@remix-run/node'
import {
	init as sentryInit,
	// setContext as sentrySetContext,
} from '@sentry/remix'
import address from 'address'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import getPort, { portNumbers } from 'get-port'
import helmet from 'helmet'
import morgan from 'morgan'
import { router } from './routes/index.js'

const MODE = process.env.NODE_ENV
const getHost = (req: { get: (key: string) => string | undefined }) =>
	req.get('X-Forwarded-Host') ?? req.get('host') ?? ''

const viteDevServer =
	process.env.NODE_ENV === 'production'
		? undefined
		: await import('vite').then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
				}),
			)

async function getBuild() {
	try {
		const build = viteDevServer
			? await viteDevServer.ssrLoadModule('virtual:remix/server-build')
			: // @ts-expect-error - the file might not exist yet but it will
				await import('../build/server/index.js')

		return { build: build as unknown as ServerBuild, error: null }
	} catch (error) {
		// Catch error and return null to make express happy and avoid an unrecoverable crash
		console.error('Error creating build:', error)
		return { error: error, build: null as unknown as ServerBuild }
	}
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const here = (...d: Array<string>) => path.join(__dirname, ...d)

if (MODE === 'production' && process.env.SENTRY_DSN) {
	void import('./utils/monitoring.js').then(({ init }) => init())
}

if (MODE === 'production' && Boolean(process.env.SENTRY_DSN)) {
	sentryInit({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 0.3,
		environment: process.env.NODE_ENV,
	})
	// TODO: once you scale, you'll want to add more context here.
	// sentrySetContext('region', { name: process.env.FLY_INSTANCE ?? 'unknown' })
}

const desiredPort = Number(process.env.PORT ?? 3000)
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})

const app = express()

app.use(
	cors({
		origin: `http://localhost:${portToUse}`,
		credentials: true,
	}),
)

// redirect from www to non-www
app.use((req, res, next) => {
	const host = getHost(req)
	if (host.startsWith('www.')) {
		return res.redirect(301, `https://${host.slice(4)}${req.url}`)
	} else {
		next()
	}
})

app.set('trust proxy', true)

app.use((req, res, next) => {
	const proto = req.get('X-Forwarded-Proto')
	const host = getHost(req)
	if (proto === 'http') {
		res.set('X-Forwarded-Proto', 'https')
		res.redirect(`https://${host}${req.originalUrl}`)
		return
	}
	next()
})

// no ending slashes for SEO reasons
app.get('*', (req, res, next) => {
	if (req.path.endsWith('/') && req.path.length > 1) {
		const query = req.url.slice(req.path.length)
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
		res.redirect(302, safepath + query)
	} else {
		next()
	}
})

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const publicAbsolutePath = here('../build/client')

if (viteDevServer) {
	app.use(viteDevServer.middlewares)
} else {
	app.use(
		express.static(publicAbsolutePath, {
			maxAge: '1w',
			setHeaders(res, resourcePath) {
				const relativePath = resourcePath.replace(`${publicAbsolutePath}/`, '')
				if (relativePath.startsWith('build/info.json')) {
					res.setHeader('cache-control', 'no-cache')
					return
				}
				// If we ever change our font (which we quite possibly never will)
				// then we'll just want to change the filename or something...
				// Remix fingerprints its assets so we can cache forever
				if (
					relativePath.startsWith('fonts') ||
					relativePath.startsWith('build')
				) {
					res.setHeader('cache-control', 'public, max-age=31536000, immutable')
				}
			},
		}),
	)
}

app.use(
	morgan('tiny', {
		skip: (req, res) =>
			res.statusCode === 200 &&
			(req.url?.startsWith('/resources/images') ||
				req.url?.startsWith('/resources/healthcheck')),
	}),
)

app.use('/api', router)

app.use((req, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})

app.use(
	helmet({
		contentSecurityPolicy: {
			useDefaults: false,

			// Use this to debug CSP issues.
			reportOnly: false,
			directives: {
				'default-src': ["'self'"],
				'frame-src': ["'self'", 'checkout.paystack.com', 'accounts.google.com'], // Prevents embedding in iframes
				'font-src': [
					"'self'",
					'fonts.gstatic.com',
					'fonts.googleapis.com',
					'embed.tawk.to',
				],
				'script-src': [
					"'self'",
					"'strict-dynamic'",
					"'unsafe-eval'",
					'accounts.google.com/gsi/client',
					'apis.google.com',
					'js.paystack.co/v2/inline.js',
					'embed.tawk.to',
					'cdn.jsdelivr.net/emojione/2.2.7/lib/js/emojione.min.js',

					// @ts-expect-error - middlewarer is not typesafe.
					(req, res) => `'nonce-${res.locals.cspNonce}'`,
				],
				'script-src-elem': [
					"'self'",
					"'unsafe-inline'",
					"'unsafe-eval'",
					'accounts.google.com/gsi/client',
					'apis.google.com',
					'js.paystack.co/v2/inline.js',
					'connect.facebook.net/en_US/sdk.js',
					'embed.tawk.to',
					'cdn.jsdelivr.net/emojione/2.2.7/lib/js/emojione.min.js',

					// TODO: figure out how to make the nonce work instead of
					// unsafe-inline. I tried adding a nonce attribute where we're using
					// inline attributes, but that didn't work. I still got that it
					// violated the CSP.
				],
				// TODO: figure out all css files and insert them. Remove unsafe-inline while you're at it.
				'style-src': [
					"'self'",
					'fonts.googleapis.com/css2',
					"'unsafe-inline'",
					'accounts.google.com/gsi/style',
					'embed.tawk.to',
				],
				'img-src': [
					"'self'",
					'data:',
					'blob:',
					'res.cloudinary.com',
					'www.gravatar.com',
					'*.googleusercontent.com',
					`${process.env.S3_BUCKET}.s3.amazonaws.com`,
					'embed.tawk.to',
					'cdn.jsdelivr.net',

					// TODO: remove this
					'images.unsplash.com',
					'flowbite.s3.amazonaws.com',
				],
				'media-src': [
					"'self'",
					'res.cloudinary.com',
					'data:',
					'blob:',
					'*.googleusercontent.com',
					`${process.env.S3_BUCKET}.s3.amazonaws.com`,
					'images.unsplash.com',
				],
				'connect-src': [
					"'self'",
					...(MODE === 'development' ? ['ws:'] : []),
					'*',
				].filter(Boolean),
				'upgrade-insecure-requests': null,
			},
		},
		crossOriginEmbedderPolicy: false,
		crossOriginOpenerPolicy: {
			policy: 'same-origin-allow-popups',
		},
	}),
)

app.all(
	'*',
	createRequestHandler({
		build: async () => {
			const { error, build } = await getBuild()
			// gracefully "catch" the error
			if (error) {
				throw error
			}
			return build
		},
		mode: MODE,
		getLoadContext(_, res) {
			return {
				cspNonce: res.locals.cspNonce, // Pass nonce to Remix loaders
				serverBuild: getBuild(),
			}
		},
	}),
)

const server = app.listen(portToUse, () => {
	const addy = server.address()
	const portUsed =
		desiredPort === portToUse
			? desiredPort
			: addy && typeof addy === 'object'
				? addy.port
				: 0

	if (portUsed !== desiredPort) {
		console.warn(
			chalk.yellow(
				`⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
			),
		)
	}
	const localUrl = `http://localhost:${portUsed}`
	let lanUrl: string | null = null
	const localIp = address.ip()
	// Check if the address is a private ip
	// https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
	// https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
	if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
		lanUrl = `http://${localIp}:${portUsed}`
	}

	console.log(
		`
  ${chalk.bold('Local:')}            ${chalk.cyan(localUrl)}
  ${lanUrl ? `${chalk.bold('On Your Network:')}  ${chalk.cyan(lanUrl)}` : ''}
  ${chalk.bold('Press Ctrl+C to stop')}
  		`.trim(),
	)
})

closeWithGrace(() => {
	return Promise.all([
		new Promise((resolve, reject) => {
			server.close((e) => (e ? reject(e) : resolve('ok')))
		}),
	])
})
