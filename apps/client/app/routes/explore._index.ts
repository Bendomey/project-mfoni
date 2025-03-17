import { redirect, type MetaFunction } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getExploreSections } from '@/api/explore/index.ts'
import { PAGES, QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { ExploreModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Explore | mfoni' },
		{
			name: 'description',
			content:
				'mfoni offers millions of free, high-quality pictures. All pictures are free to download and use under the mfoni license.',
		},
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export async function loader() {
	const queryClient = new QueryClient()
	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	try {
		await queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.EXPLORE],
			queryFn: () =>
				getExploreSections(
					{
						sorter: {
							sort: 'asc',
							sortBy: 'sort',
						},
						pagination: {
							page: 0,
							per: 50,
						},
					},
					{
						baseUrl,
					},
				),
		})

		const dehydratedState = dehydrate(queryClient)
		return jsonWithCache({
			dehydratedState,
		})
	} catch {
		return redirect(PAGES.NOT_FOUND)
	}
}

export default ExploreModule
