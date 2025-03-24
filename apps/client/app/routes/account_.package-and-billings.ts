import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getCreatorSubscriptions } from '@/api/subscriptions/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { protectCreatorRouteLoader } from '@/lib/actions/protect-creator-route-loader.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { PackageAndBillingsModule } from '@/modules/index.ts'

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
			origin: getDomainUrl(loaderArgs.request),
		})
	}

	return res
}

export const meta: MetaFunction<any> = ({ data, location }) => {
	const meta = getSocialMetas({
		title: 'Package And Billings | mfoni',
		description: 'Manage your package and billings on mfoni',
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		origin: data?.origin,
	})

	return meta
}

export default PackageAndBillingsModule
