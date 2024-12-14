import {
	type LoaderFunctionArgs,
	redirect,
	type MetaFunction,
} from '@remix-run/node'

import { dehydrate, QueryClient } from '@tanstack/react-query'
import {
	getCollectionBySlug,
	getCollectionContentsBySlug,
} from '@/api/collections/index.ts'
import { PAGES, QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { safeString } from '@/lib/strings.ts'
import { CollectionModule } from '@/modules/index.ts'

export async function loader(loaderArgs: LoaderFunctionArgs) {
	const queryClient = new QueryClient()

	const authCookie = await extractAuthCookie(
		loaderArgs.request.headers.get('cookie'),
	)

	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	let collection: Collection | undefined = undefined
	try {
		collection = await getCollectionBySlug(
			safeString(loaderArgs.params.collection),
			{
				filters: {
					contentItemsLimit: 2,
				},
				populate: ['collection.createdBy'],
			},
			{
				baseUrl,
				authToken: authCookie?.token,
			},
		)

		// if content is private and user is not logged in, return 404
		if (collection?.visibility === 'PRIVATE') {
			if (!authCookie?.token || authCookie?.id !== collection?.createdById) {
				return redirect(PAGES.NOT_FOUND)
			}
		}
	} catch (error) {
		// if collection is not found, return 404
		return redirect(PAGES.NOT_FOUND)
	}

	const isCollectionMine = collection?.createdBy?.id === authCookie?.id
	const slug = safeString(collection?.slug)
	const query = {
		pagination: { page: 0, per: 50 },
		filters: {
			visibility: isCollectionMine ? 'ALL' : 'PUBLIC',
		},
	}
	await queryClient.prefetchQuery({
		queryKey: [QUERY_KEYS.COLLECTIONS, slug, 'slug-contents', query],
		queryFn: () =>
			getCollectionContentsBySlug(slug, query, {
				authToken: authCookie?.token,
				baseUrl,
			}),
	})

	const dehydratedState = dehydrate(queryClient)

	return jsonWithCache({
		dehydratedState,
		collection,
		origin: getDomainUrl(loaderArgs.request),
	})
}

export const meta: MetaFunction<typeof loader> = ({
	data,
	params,
	location,
}) => {
	return getSocialMetas({
		title: data?.collection
			? `${data?.collection?.name} | mfoni`
			: '404: Collection Not Found',
		description: data?.collection
			? data?.collection?.description
			: `Browse through the carefully curated contents around "${params.collection}" — you could also submit your best work.`,
		images: data?.collection
			? data?.collection?.contentItems?.map((item) => item.content?.media?.url!)
			: [],
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
	})
}

export default CollectionModule
