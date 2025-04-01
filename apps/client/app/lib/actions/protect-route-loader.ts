import { redirect, type LoaderFunction } from '@remix-run/node'
import { getFullUrlPath } from '../url-helpers.ts'
import { extractAuthCookie } from './extract-auth-cookie.ts'
import { PAGES } from '@/constants/index.ts'

export const protectRouteLoader: LoaderFunction = async ({ request }) => {
	const cookieString = request.headers.get('cookie')

	if (cookieString) {
		const authCookie = await extractAuthCookie(cookieString)
		if (authCookie) {
			return null
		}
	}

	return redirect(
		`${PAGES.LOGIN}?return_to=${getFullUrlPath(new URL(request.url))}`,
	)
}
