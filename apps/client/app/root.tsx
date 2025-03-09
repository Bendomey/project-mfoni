import { cssBundleHref } from '@remix-run/css-bundle'
import {
	type LoaderFunctionArgs,
	type LinksFunction,
	redirect,
} from '@remix-run/node'
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteError,
	isRouteErrorResponse,
	useLoaderData,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import { type PropsWithChildren } from 'react'
import { Toaster } from 'react-hot-toast'
import remixImageStyles from 'remix-image/remix-image.css?url'
import { getCurrentUser } from './api/auth/index.ts'
import { RouteLoader } from './components/loader/route-loader.tsx'
import { PAGES } from './constants/index.ts'
import 'dayjs/locale/en-gb.js'
import { environmentVariables } from './lib/actions/env.server.ts'
import { extractAuthCookie } from './lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from './lib/actions/json-with-cache.server.ts'
import { useNonce } from './lib/nonce-provider.ts'
import { getFullUrlPath } from './lib/url-helpers.ts'
import { EnvContext } from './providers/env/index.tsx'
import { Providers } from './providers/index.tsx'
import globalStyles from '@/styles/global.css?url'
import tailwindStyles from '@/styles/tailwind.css?url'

dayjs.locale('en-gb')
dayjs.extend(localizedFormat)

export const links: LinksFunction = () => {
	return [
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/apple-touch-icon.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '32x32',
			href: '/favicon-32x32.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '16x16',
			href: '/favicon-16x16.png',
		},
		{
			rel: 'manifest',
			href: '/site.webmanifest',
		},
		{ rel: 'icon', href: '/favicon.ico' },
		{ rel: 'stylesheet', href: tailwindStyles },
		{ rel: 'stylesheet', href: remixImageStyles },
		{ rel: 'stylesheet', href: globalStyles },
		...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
	]
}

export async function loader(args: LoaderFunctionArgs) {
	const url = new URL(args.request.url)
	let user: User | null = null

	const cookieString = args.request.headers.get('cookie')
	if (cookieString) {
		const authCookie = await extractAuthCookie(cookieString)
		if (authCookie) {
			try {
				const res = await getCurrentUser(authCookie.token)

				if (res?.data) {
					user = res.data

					if (
						!res.data.role &&
						url.pathname !== PAGES.AUTHENTICATED_PAGES.ONBOARDING
					) {
						return redirect(
							`${
								PAGES.AUTHENTICATED_PAGES.ONBOARDING
							}?return_to=${getFullUrlPath(url)}`,
						)
					}
				}
			} catch {
				if (url.pathname !== PAGES.LOGIN) {
					return redirect(`${PAGES.LOGIN}?return_to=${getFullUrlPath(url)}`)
				}
			}
		}
	}

	return jsonWithCache({
		ENV: {
			API_ADDRESS: `${environmentVariables().API_ADDRESS}/api`,
			BUCKET: environmentVariables().S3_BUCKET,
			MFONI_GOOGLE_AUTH_CLIENT_ID:
				environmentVariables().MFONI_GOOGLE_AUTH_CLIENT_ID,
			FACEBOOK_APP_ID: environmentVariables().FACEBOOK_APP_ID,
		},
		authUser: user,
	})
}

function App() {
	const data = useLoaderData<typeof loader>()

	return (
		<Document
			ENV={{
				FACEBOOK_APP_ID: data.ENV.FACEBOOK_APP_ID,
				MFONI_GOOGLE_AUTH_CLIENT_ID: data.ENV.MFONI_GOOGLE_AUTH_CLIENT_ID,
				API_ADDRESS: data.ENV.API_ADDRESS,
			}}
		>
			<Providers authData={data.authUser as User | null}>
				<RouteLoader />
				<Outlet />
			</Providers>
		</Document>
	)
}

export default withSentry(App)

interface DocumentProps {
	ENV: {
		MFONI_GOOGLE_AUTH_CLIENT_ID: string
		FACEBOOK_APP_ID: string
		API_ADDRESS: string
	}
}

function Document({ children, ENV }: PropsWithChildren<DocumentProps>) {
	const cspNonce = useNonce()
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<EnvContext.Provider
					value={{
						MFONI_GOOGLE_AUTH_CLIENT_ID: ENV.MFONI_GOOGLE_AUTH_CLIENT_ID,
						FACEBOOK_APP_ID: ENV.FACEBOOK_APP_ID,
						API_ADDRESS: ENV.API_ADDRESS,
					}}
				>
					{children}
					<Toaster
						position="bottom-center"
						toastOptions={{
							duration: 500,
						}}
					/>
					<ScrollRestoration nonce={cspNonce} />
					<script
						suppressHydrationWarning
						src="https://accounts.google.com/gsi/client"
						async
						defer
						nonce={cspNonce}
						data-nscript="afterInteractive"
					/>
					<script
						suppressHydrationWarning
						src="https://js.paystack.co/v2/inline.js"
						async
						defer
						nonce={cspNonce}
						data-nscript="afterInteractive"
					/>
					<script
						suppressHydrationWarning
						nonce={cspNonce}
						dangerouslySetInnerHTML={{
							__html: `window.ENV = ${JSON.stringify({
								API_ADDRESS: ENV.API_ADDRESS,
							})}`,
						}}
					/>
					<Scripts nonce={cspNonce} />
				</EnvContext.Provider>
			</body>
		</html>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>
					{error.status} {error.statusText}
				</h1>
				<p>{error.data}</p>
			</div>
		)
	} else if (error instanceof Error) {
		return (
			<div>
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>
			</div>
		)
	} else {
		return <h1>Unknown Error</h1>
	}
}
