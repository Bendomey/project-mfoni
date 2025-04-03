import { redirect, type LoaderFunction } from '@remix-run/node'
import { getFullUrlPath } from '../url-helpers.ts'
import { PAGES } from '@/constants/index.ts'

export const protectCreatorRouteLoader: LoaderFunction = async ({
	context,
	request,
}) => {
	const { currentUser } = context as IMfoniRemixContext

	if (currentUser) {
		const currentUserThrewAnError = currentUser instanceof Error
		if (!currentUserThrewAnError) {
			if (currentUser?.creator) {
				return null
			}

			throw new Response(null, {
				status: 404,
				statusText: 'Not Found',
			})
		}
	}

	return redirect(
		`${PAGES.LOGIN}?return_to=${getFullUrlPath(new URL(request.url))}`,
	)
}
