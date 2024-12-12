import { redirect, type LoaderFunction } from '@remix-run/node'
import { getFullUrlPath } from '../url-helpers.ts'
import { extractAuthCookie } from './extract-auth-cookie.ts'
import { getCurrentUser } from '@/api/auth/index.ts'
import { PAGES } from '@/constants/index.ts'

export const protectCreatorRouteLoader: LoaderFunction = async ({
	request,
}) => {
	const cookieString = request.headers.get('cookie')
	const authCookie = await extractAuthCookie(cookieString)

	if (authCookie) {
		const res = await getCurrentUser(authCookie.token)

		if (!res?.data.creator) {
			// TODO: look into designing 404 pages with error boundaries
			// throw new Response(null, {
			//   status: 404,
			//   statusText: 'Not Found',
			// })
			return redirect(PAGES.NOT_FOUND)
		}

		return null
	}

	return redirect(
		`${PAGES.LOGIN}?return_to=${getFullUrlPath(new URL(request.url))}`,
	)
}
