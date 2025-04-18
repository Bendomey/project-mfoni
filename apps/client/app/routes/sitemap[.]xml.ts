import { generateSitemap } from '@nasa-gcn/remix-seo'
import { type ServerBuild, type LoaderFunctionArgs } from '@remix-run/node'
import { getDomainUrl } from '@/lib/misc.ts'

export async function loader({ request, context }: LoaderFunctionArgs) {
	const serverBuild = (await context.serverBuild) as { build: ServerBuild }

	return generateSitemap(request, serverBuild.build.routes, {
		siteUrl: getDomainUrl(request),
		headers: {
			'Cache-Control': `public, max-age=${60 * 5}`,
			'Content-Type': 'application/xml',
		},
	})
}
