import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'

import { dehydrate, QueryClient } from '@tanstack/react-query'
import {
	getCollectionBySlug,
	getCollectionContentsBySlug,
} from '@/api/collections/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { bypassCfAssetWorkerUrl } from '@/lib/bypass-cf-asset-worker.ts'
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
				populate: ['collection.createdBy', 'content', 'content.createdBy'],
			},
			{
				baseUrl,
				authToken: authCookie?.token,
			},
		)

		// if content is private and user is not logged in, return 404
		if (collection?.visibility === 'PRIVATE') {
			if (!authCookie?.token || authCookie?.id !== collection?.createdById) {
				throw new Response(null, {
					status: 404,
					statusText: 'Page Not Found',
				})
			}
		}
	} catch {
		// if collection is not found, return 404
		throw new Response(null, {
			status: 404,
			statusText: 'Page Not Found',
		})
	}

	const isCollectionMine = collection?.createdBy?.id === authCookie?.id
	const slug = safeString(collection?.slug)
	const query = {
		pagination: { page: 0, per: 50 },
		filters: {
			visibility: isCollectionMine ? 'ALL' : 'PUBLIC',
		},
		populate: ['content'],
	}
	queryClient.prefetchQuery({
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
			? data?.collection?.contentItems?.map((item) =>
					bypassCfAssetWorkerUrl(safeString(item.content?.media?.url)),
				)
			: [],
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		origin: data?.origin,
		keywords: 'collections, digital collections, curated collections',
	})
}

export default CollectionModule
