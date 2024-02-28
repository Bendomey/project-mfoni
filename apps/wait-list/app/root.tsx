import {cssBundleHref} from '@remix-run/css-bundle'
import {type PropsWithChildren} from 'react'
import {json, type LinksFunction} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
} from '@remix-run/react'
import {NODE_ENV} from './constants/index.ts'
import tailwindStyles from '@/styles/tailwind.css'
import {Providers} from './providers/index.tsx'
import {RouteLoader} from './components/loader/route-loader.tsx'

export const links: LinksFunction = () => {
  return [
    //@TODO: Include assets.
    // {
    //   rel: 'apple-touch-icon',
    //   sizes: '180x180',
    //   href: '/favicons/apple-touch-icon.png',
    // },
    // {
    //   rel: 'icon',
    //   type: 'image/png',
    //   sizes: '32x32',
    //   href: '/favicons/favicon-32x32.png',
    // },
    // {
    //   rel: 'icon',
    //   type: 'image/png',
    //   sizes: '16x16',
    //   href: '/favicons/favicon-16x16.png',
    // },
    {rel: 'icon', href: '/favicon.ico'},
    {rel: 'stylesheet', href: tailwindStyles},
    ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
  ]
}

export async function loader() {
  return json({
    ENV: {
      API_ADDRESS: `${process.env.API_ADDRESS}/api`,
    },
  })
}

export default function App() {
  return (
    <Document>
      <Providers>
        <RouteLoader />
        <Outlet />
      </Providers>
    </Document>
  )
}

function Document({children}: PropsWithChildren) {
  const data = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
          data-nscript="afterInteractive"
        />
        <script type="text/javascript" src="https://sdk.dev.metric.africa/v1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        {NODE_ENV === 'development' ? <LiveReload /> : null}
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
