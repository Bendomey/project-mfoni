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
import { RouteLoader } from './components/loader/route-loader.tsx'
import { PAGES } from './constants/index.ts'
import 'dayjs/locale/en-gb.js'
import { environmentVariables } from './lib/actions/env.server.ts'
import { jsonWithCache } from './lib/actions/json-with-cache.server.ts'
import { useNonce } from './lib/nonce-provider.ts'
import { getFullUrlPath } from './lib/url-helpers.ts'
import { NotFoundModule } from './modules/index.ts'
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
		{ rel: 'stylesheet', href: globalStyles },
		{ rel: 'stylesheet', href: tailwindStyles },
	]
}

export async function loader(args: LoaderFunctionArgs) {
	const { currentUser } = args.context as IMfoniRemixContext
	const url = new URL(args.request.url)
	let user: User | null = null

	if (currentUser) {
		if (currentUser instanceof Error) {
			if (url.pathname !== PAGES.LOGIN) {
				return redirect(`${PAGES.LOGIN}?return_to=${getFullUrlPath(url)}`)
			}
		} else {
			user = currentUser

			if (
				!currentUser.role &&
				url.pathname !== PAGES.AUTHENTICATED_PAGES.ONBOARDING
			) {
				return redirect(
					`${PAGES.AUTHENTICATED_PAGES.ONBOARDING}?return_to=${getFullUrlPath(
						url,
					)}`,
				)
			}
		}
	}

	return jsonWithCache({
		ENV: {
			API_ADDRESS: `${environmentVariables().API_ADDRESS}/api`,
			MFONI_GOOGLE_AUTH_CLIENT_ID:
				environmentVariables().MFONI_GOOGLE_AUTH_CLIENT_ID,
			FACEBOOK_APP_ID: environmentVariables().FACEBOOK_APP_ID,
			TAWK_ID: environmentVariables().TAWK_ID,
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
				TAWK_ID: data.ENV.TAWK_ID,
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
		TAWK_ID: string
	}
	noIndex?: boolean
}

function Document({
	children,
	ENV,
	noIndex,
}: PropsWithChildren<DocumentProps>) {
	const cspNonce = useNonce()
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="theme-color" content="#1C4ED8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{noIndex ? <meta name="robots" content="noindex" /> : null}
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
						type="text/javascript"
						nonce={cspNonce}
						async
						defer
						data-nscript="afterInteractive"
						suppressHydrationWarning
						dangerouslySetInnerHTML={{
							__html: `
								var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
								(function(){
									var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
									s1.async=true;
									s1.src='https://embed.tawk.to/${ENV.TAWK_ID}/1im510led';
									s1.charset='UTF-8';
									s1.setAttribute('crossorigin','*');
									s0.parentNode.insertBefore(s1,s0);
								})();
            				`,
						}}
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
			<Document
				noIndex
				ENV={{
					API_ADDRESS: '',
					MFONI_GOOGLE_AUTH_CLIENT_ID: '',
					TAWK_ID: '',
					FACEBOOK_APP_ID: '',
				}}
			>
				<NotFoundModule
					status={error.status}
					title={error.statusText}
					message={error.data}
				/>
			</Document>
		)
	} else if (error instanceof Error) {
		return (
			<Document
				noIndex
				ENV={{
					API_ADDRESS: '',
					MFONI_GOOGLE_AUTH_CLIENT_ID: '',
					TAWK_ID: '',
					FACEBOOK_APP_ID: '',
				}}
			>
				<NotFoundModule
					status={500}
					title={error.message}
					message={error.stack}
				/>
			</Document>
		)
	} else {
		return <h1>Unknown Error</h1>
	}
}
