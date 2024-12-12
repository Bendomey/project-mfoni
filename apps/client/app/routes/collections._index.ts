import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getCollections } from '@/api/collections/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { CollectionsModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Collections | mfoni' },
		{
			name: 'description',
			content: 'Explore all collections on mfoni',
		},
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const queryClient = new QueryClient()

	const authCookie = await extractAuthCookie(
		loaderArgs.request.headers.get('cookie'),
	)

	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	const query = {
		pagination: { page: 0, per: 50 },
		filters: {
			visibility: 'PUBLIC',
		},
		populate: ['collection.createdBy'],
	}
	await queryClient.prefetchQuery({
		queryKey: [QUERY_KEYS.COLLECTIONS, JSON.stringify(query)],
		queryFn: () =>
			getCollections(query, {
				authToken: authCookie?.token,
				baseUrl,
			}),
	})

	const dehydratedState = dehydrate(queryClient)
	return jsonWithCache({
		dehydratedState,
	})
}

export default CollectionsModule
