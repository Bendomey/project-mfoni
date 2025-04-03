import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getContentBySlug } from '@/api/contents/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { safeString } from '@/lib/strings.ts'
import { PhotoModule } from '@/modules/index.ts'

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const queryClient = new QueryClient()

	const authCookie = await extractAuthCookie(
		loaderArgs.request.headers.get('cookie'),
	)

	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	let content: Content | undefined = undefined
	try {
		content = await queryClient.fetchQuery({
			queryKey: ['contents', safeString(loaderArgs.params.slug), 'slug'],
			queryFn: () =>
				getContentBySlug(
					safeString(loaderArgs.params.slug),
					{
						filters: {},
						populate: ['content.createdBy', 'content.tags'],
					},
					{
						baseUrl,
						authToken: authCookie?.token,
					},
				),
		})

		// if content is private and user is not logged in, return 404
		if (content?.visibility === 'PRIVATE') {
			if (!authCookie?.token || authCookie?.id !== content?.createdById) {
				throw new Response(null, {
					status: 404,
					statusText: 'Page Not Found',
				})
			}
		}
	} catch {
		// if content is not found, return 404
		throw new Response(null, {
			status: 404,
			statusText: 'Page Not Found',
		})
	}

	const dehydratedState = dehydrate(queryClient)

	return jsonWithCache({
		dehydratedState,
		content,
		origin: getDomainUrl(loaderArgs.request),
	})
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
	return getSocialMetas({
		title: data?.content
			? `${data?.content?.title} | mfoni`
			: '404: Content Not Found',
		description: `Photo uploaded by ${data?.content?.createdBy?.name}`,
		images: data?.content?.media?.url ? [data?.content?.media?.url] : [],
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		origin: data?.origin,
		keywords: data?.content?.tags?.map((tag) => tag.name).join(', '),
	})
}

export default PhotoModule
