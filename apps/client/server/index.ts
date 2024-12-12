 

import path from 'path'
import { fileURLToPath } from 'url'
import { createRequestHandler } from '@remix-run/express'
import { type ServerBuild } from '@remix-run/node'
import address from 'address'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import getPort, { portNumbers } from 'get-port'
import morgan from 'morgan'
import { router } from './routes/index.js'

const MODE = process.env.NODE_ENV

const viteDevServer =
	process.env.NODE_ENV === 'production'
		? undefined
		: await import('vite').then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
				}),
			)

const getBuild = async (): Promise<ServerBuild> => {
	if (viteDevServer) {
		return viteDevServer.ssrLoadModule('virtual:remix/server-build') as any
	}

	// @ts-expect-error - this file may or may not exist yet
	return import('../build/server/index.js') as Promise<ServerBuild>
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const here = (...d: Array<string>) => path.join(__dirname, ...d)

const app = express()

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

app.use(morgan('tiny'))

app.use('/api', router)

app.all(
	'*',
	createRequestHandler({
		build: MODE === 'development' ? getBuild : await getBuild(),
		mode: MODE,
	}),
)

const desiredPort = Number(process.env.PORT ?? 3000)
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})

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
