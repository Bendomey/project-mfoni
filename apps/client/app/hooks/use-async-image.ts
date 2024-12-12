import React from 'react'

type IAsyncImage = (
	/**
	 * Image url to be loaded.
	 */
	url?: string | null,
) => {
	pending: boolean
	ready: boolean | null
	error: string | Event | null
}

/**
 * Hook that serves as a simple api to deliver the
 * state of an image from loading to loaded, while
 * caching the image.
 *
 * "Once an image has been loaded in any way into the browser,
 * it will be in the browser cache and will load much faster
 * the next time it is used whether that use is in the current
 * page or in any other page as long as the image is used before
 * it expires from the browser cache."
 * - https://stackoverflow.com/a/10240297.
 *
 * Then, after the image is cached, the api will return that
 * the image has been cached and is ready to be displayed.
 *
 * Finally, render the image and it'll pull from cache.
 */
export const useAsyncImage: IAsyncImage = (url) => {
	const [pending, setPending] = React.useState<boolean>(true)
	const [ready, setIsReady] = React.useState<boolean | null>(null)
	const [error, setError] = React.useState<string | Event | null>(null)

	const onLoad = () => {
		setIsReady(true)
		setPending(false)
	}

	const onError = (e: string | Event) => {
		setError(e)
		setPending(false)
	}

	/* Cancel subscription if component unmounts https://juliangaramendy.dev/use-promise-subscription/ */
	React.useEffect(() => {
		function resetStateOnUrlChange() {
			setPending(true)
			setIsReady(null)
			setError(null)
		}

		let isSubscribed = true
		resetStateOnUrlChange()

		if (url) {
			try {
				const image = new Image()
				image.onload = () => {
					if (isSubscribed) {
						onLoad()
					}
				}
				image.onerror = (e) => {
					if (isSubscribed) {
						onError(e)
					}
				}
				image.src = url
			} catch (e: unknown) {
				onError(e as string)
			}
		}

		return () => {
			isSubscribed = false
		}
	}, [url])

	return {
		pending,
		ready,
		error,
	}
}
