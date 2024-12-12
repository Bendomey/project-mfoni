function removeTrailingSlash(s: string) {
	return s.endsWith('/') ? s.slice(0, -1) : s
}

function getOrigin(requestInfo?: { origin?: string; path: string }) {
	return requestInfo?.origin ?? 'https://mfoni.app'
}

function getUrl(requestInfo?: { origin: string; path: string }) {
	return removeTrailingSlash(
		`${getOrigin(requestInfo)}${requestInfo?.path ?? ''}`,
	)
}

export function getDisplayUrl(requestInfo?: { origin: string; path: string }) {
	return getUrl(requestInfo).replace(/^https?:\/\//, '')
}

/**
 * @returns domain URL (without a ending slash, like: https://mfoni.app)
 */
export function getDomainUrl(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
	if (!host) {
		throw new Error('Could not determine domain URL.')
	}
	const protocol = host.includes('localhost') ? 'http' : 'https'
	return `${protocol}://${host}`
}

export const getNameInitials = (name: string) =>
	name
		.split(' ')
		.map((n) => n[0])
		.join('')