import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getUserContentLikes } from '@/api/users/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { AccountLikesModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'My Collections | mfoni' },
		{ name: 'description', content: 'Welcome to mfoni!' },
		{ name: 'keywords', content: 'mfoni' },
	]
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const queryClient = new QueryClient()

	const authCookie = await extractAuthCookie(
		loaderArgs.request.headers.get('cookie'),
	)

	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	if (authCookie) {
		const query = {
			pagination: { page: 0, per: 50 },
			populate: ['content'],
			filters: {
				visibility: 'ALL',
			},
		}
		queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.CONTENT_LIKES, 'user', authCookie.id, query],
			queryFn: () =>
				getUserContentLikes(authCookie.id, query, {
					authToken: authCookie.token,
					baseUrl,
				}),
		})

		const dehydratedState = dehydrate(queryClient)
		return jsonWithCache({
			dehydratedState,
		})
	}

	// this should never happen but just in case
	return null
}

export default AccountLikesModule
