import {
	redirect,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getCreatorByUsername } from '@/api/creators/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { safeString } from '@/lib/strings.ts'
import { CreatorPage } from '@/modules/index.ts'

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const queryClient = new QueryClient()
	let { username } = loaderArgs.params

	if (username && !username.startsWith('@')) {
		return redirect(`/@${username}`)
	}

	username = username?.replace('@', '')

	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	try {
		const creator = await queryClient.fetchQuery({
			queryKey: [QUERY_KEYS.CREATORS, username],
			queryFn: () => getCreatorByUsername(safeString(username), { baseUrl }),
		})

		const dehydratedState = dehydrate(queryClient)
		if (creator)
			return jsonWithCache({
				dehydratedState,
				creator,
				origin: getDomainUrl(loaderArgs.request),
			})
	} catch {
		throw new Response(null, {
			status: 404,
			statusText: 'Not Found',
		})
	}
}

export const meta: MetaFunction<typeof loader> = ({
	data,
	params,
	location,
}) => {
	return getSocialMetas({
		title: data?.creator
			? `${data?.creator?.name} | mfoni`
			: '404: creator Not Found',
		description: `View ${
			data?.creator?.name ?? params?.username
		}'s mfoni profile`,
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		images: data?.creator?.photo ? [data?.creator?.photo] : [],
		origin: data?.origin,
		keywords:
			data?.creator?.interests?.map((interest) => interest).join(', ') ?? '',
	})
}

export default CreatorPage
