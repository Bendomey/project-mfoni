import { redirect, type LoaderFunction } from '@remix-run/node'
import { getFullUrlPath } from '../url-helpers.ts'
import { PAGES } from '@/constants/index.ts'

export const protectRouteLoader: LoaderFunction = async ({
	request,
	context,
}) => {
	const { currentUser } = context as IMfoniRemixContext

	if (currentUser) {
		if (!(currentUser instanceof Error)) {
			return null
		}
	}

	return redirect(
		`${PAGES.LOGIN}?return_to=${getFullUrlPath(new URL(request.url))}`,
	)
}
