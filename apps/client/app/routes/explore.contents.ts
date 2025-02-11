import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getContents } from '@/api/contents/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { validateLicense, validateOrientation } from '@/lib/misc.ts'
import { ContentsModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Contents | mfoni' },
		{
			name: 'description',
			content:
				'mfoni offers millions of free, high-quality pictures. All pictures are free to download and use under the mfoni license.',
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
			license: validateLicense(loaderArgs.params.license ?? 'ALL'),
			orientation: validateOrientation(loaderArgs.params.orientation ?? 'ALL'),
		},
		populate: ['content.createdBy'],
	}
	await queryClient.prefetchQuery({
		queryKey: [QUERY_KEYS.CONTENTS, query],
		queryFn: () =>
			getContents(query, {
				authToken: authCookie?.token,
				baseUrl,
			}),
	})

	const dehydratedState = dehydrate(queryClient)
	return jsonWithCache({
		dehydratedState,
	})
}

export default ContentsModule
