import { RemixBrowser } from '@remix-run/react'
import * as React from 'react'
import { hydrateRoot } from 'react-dom/client'

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
	void import('./lib/monitoring.client.ts').then(({ init }) => init())
}

function hydrate() {
	React.startTransition(() => {
		hydrateRoot(document, <RemixBrowser />)
	})
}

if (window.requestIdleCallback) {
	window.requestIdleCallback(hydrate)
} else {
	window.setTimeout(hydrate, 1)
}
