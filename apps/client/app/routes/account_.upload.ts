import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
} from '@remix-run/node'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getCollectionBySlug } from '@/api/collections/index.ts'
import { createContent, type CreateContentInput } from '@/api/contents/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { protectRouteLoader } from '@/lib/actions/protect-route-loader.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { UploadModule } from '@/modules/index.ts'

export async function action({ request }: ActionFunctionArgs) {
	const authCookie = await extractAuthCookie(request.headers.get('cookie'))

	if (authCookie) {
		const formData = await request.formData()
		const contents = formData.get('contents')

		if (!contents) return { error: 'No content found' }

		const baseUrl = `${environmentVariables().API_ADDRESS}/api`

		const updatedContents: CreateContentInput = (
			JSON.parse(contents as string) as CreateContentInput
		).map((content) => ({
			...content,
			content: {
				...content.content,

				// Main reason for moving the operation to the server side. So that we don't expose the s3 bucket on the client.
				bucket: environmentVariables().S3_BUCKET,
			},
		}))

		try {
			await createContent(updatedContents, {
				authToken: authCookie.token,
				baseUrl,
			})

			// Let them see their contents.
			return redirect('/account/uploads')
		} catch (error: unknown) {
			if (error instanceof Error) {
				return { error: error.message }
			}
		}
	}

	return { error: 'Auth Not Available' }
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const res = await protectRouteLoader(loaderArgs)
	if (!res) {
		const queryClient = new QueryClient()
		const authCookie = await extractAuthCookie(
			loaderArgs.request.headers.get('cookie'),
		)

		const baseUrl = `${environmentVariables().API_ADDRESS}/api`

		if (authCookie) {
			const slug = `${authCookie.id}_uploads`
			queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.COLLECTIONS, slug, 'slug'],
				queryFn: () =>
					getCollectionBySlug(
						slug,
						{
							filters: { contentItemsLimit: 0 },
						},
						{
							authToken: authCookie.token,
							baseUrl,
						},
					),
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
		title: 'Upload | mfoni',
		description: 'Upload your contents to the world',
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		origin: data?.origin,
	})

	return meta
}

export default UploadModule
