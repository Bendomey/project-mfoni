import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import * as reactQuery from '@tanstack/react-query'
import { getCollections } from '@/api/collections/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { safeString } from '@/lib/strings.ts'
import { SearchCollectionsModule } from '@/modules/index.ts'

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const queryClient = new reactQuery.QueryClient()

	const authCookie = await extractAuthCookie(
		loaderArgs.request.headers.get('cookie'),
	)

	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	const query = {
		pagination: { page: 0, per: 50 },
		filters: { visibility: 'PUBLIC' },
		search: {
			query: safeString(loaderArgs.params.query),
		},
		populate: ['collection.createdBy', 'content'],
	}
	await queryClient.prefetchQuery({
		queryKey: [QUERY_KEYS.COLLECTIONS, query],
		queryFn: () =>
			getCollections(query, {
				authToken: authCookie?.token,
				baseUrl,
			}),
	})

	const dehydratedState = reactQuery.dehydrate(queryClient)
	return jsonWithCache({
		dehydratedState,
		origin: getDomainUrl(loaderArgs.request),
	})
}

export const meta: MetaFunction<typeof loader> = ({
	data,
	params,
	location,
}) => {
	return getSocialMetas({
		title: `${params?.query} | mfoni`,
		description: `Search results for ${params?.query} on mfoni. Download free, high-quality pictures.`,
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		keywords: 'search,collections',
	})
}

export default SearchCollectionsModule
