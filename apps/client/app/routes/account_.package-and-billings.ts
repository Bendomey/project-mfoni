import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getCreatorSubscriptions } from '@/api/subscriptions/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { protectCreatorRouteLoader } from '@/lib/actions/protect-creator-route-loader.ts'
import { PackageAndBillingsModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Package And Billings | mfoni' },
		{
			name: 'description',
			content: 'Manage your package and billings on mfoni',
		},
		{ name: 'keywords', content: 'mfoni' },
	]
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const res = await protectCreatorRouteLoader(loaderArgs)
	if (!res) {
		const queryClient = new QueryClient()
		const searchParams = new URL(loaderArgs.request.url).searchParams
		const page = searchParams.get('page') ?? '0'
		const authCookie = await extractAuthCookie(
			loaderArgs.request.headers.get('cookie'),
		)
		const baseUrl = `${environmentVariables().API_ADDRESS}/api`

		if (authCookie) {
			const query = {
				pagination: { page: Number(page), per: 50 },
				populate: ['purchase', 'wallet'],
			}
			queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.CREATOR_SUBSCRIPTIONS, query],
				queryFn: () =>
					getCreatorSubscriptions(query, {
						authToken: authCookie.token,
						baseUrl,
					}),
			})
		}

		const dehydratedState = dehydrate(queryClient)
		return jsonWithCache({
			dehydratedState,
		})
	}

	return res
}

export default PackageAndBillingsModule
