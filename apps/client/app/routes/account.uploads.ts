import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getCollectionContentsBySlug } from '@/api/collections/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { protectCreatorRouteLoader } from '@/lib/actions/protect-creator-route-loader.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { AccountUploadsModule } from '@/modules/index.ts'

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const creatorRes = await protectCreatorRouteLoader(loaderArgs)
	if (!creatorRes) {
		const queryClient = new QueryClient()
		const authCookie = await extractAuthCookie(
			loaderArgs.request.headers.get('cookie'),
		)

		const baseUrl = `${environmentVariables().API_ADDRESS}/api`

		if (authCookie) {
			const query = {
				pagination: { page: 0, per: 50 },
				populate: ['content', 'content.tags'],
				filters: {
					visibility: 'ALL',
				},
			}
			const slug = `${authCookie.id}_uploads`
			queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.COLLECTIONS, slug, 'slug-contents', query],
				queryFn: () =>
					getCollectionContentsBySlug(slug, query, {
						authToken: authCookie.token,
						baseUrl,
					}),
			})

			const dehydratedState = dehydrate(queryClient)
			return jsonWithCache({
				dehydratedState,
				origin: getDomainUrl(loaderArgs.request),
			})
		}
	}
	return creatorRes
}

export const meta: MetaFunction<any> = ({ data, location }) => {
	const meta = getSocialMetas({
		title: 'My Uploads | mfoni',
		description: 'Manage your uploads here on mfoni',
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		origin: data?.origin,
		keywords: 'uploads, uploaded, content uploads',
	})

	return meta
}

export default AccountUploadsModule
