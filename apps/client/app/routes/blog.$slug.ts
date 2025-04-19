import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { getMdxPage } from '@/lib/actions/mdx.server.ts'
import { bypassCfAssetWorkerUrl } from '@/lib/bypass-cf-asset-worker.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { requireValidSlug } from '@/lib/requireValidSlug.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { SingleBlogModule } from '@/modules/index.ts'

export async function loader({ params, request }: LoaderFunctionArgs) {
	requireValidSlug(params.slug)

	const mdxContent = await getMdxPage({
		contentDir: 'app/modules/blog/articles',
		slug: params.slug,
	})

	if (!mdxContent) {
		throw new Response(null, {
			status: 404,
			statusText: 'Page Not Found',
		})
	}

	return jsonWithCache({
		code: mdxContent.code,
		frontmatter: mdxContent.frontmatter,
		origin: getDomainUrl(request),
	})
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
	const meta = getSocialMetas({
		title: `${data?.frontmatter?.title} | mfoni`,
		description: data?.frontmatter?.description,
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		images: data?.frontmatter?.imageUrl
			? [bypassCfAssetWorkerUrl(data?.frontmatter?.imageUrl)]
			: undefined,
		origin: data?.origin,
		keywords: data?.frontmatter?.keywords,
	})

	return meta
}

export default SingleBlogModule
