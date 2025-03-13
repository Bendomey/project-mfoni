import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { getDisplayUrl, getDomainUrl } from '@/lib/misc.ts'
import { getSocialMetas } from '@/lib/seo.ts'
import { ReportContentsModule } from '@/modules/index.ts'

export async function loader(loaderArgs: LoaderFunctionArgs) {
	return jsonWithCache({
		origin: getDomainUrl(loaderArgs.request),
	})
}

export const meta: MetaFunction<typeof loader> = ({
	data,
	params,
	location,
}) => {
	return getSocialMetas({
		title: 'Report Content - Help Keep Our Platform Safe | mfoni',
		description: `Search results for ${params?.query} on mfoni. Download free, high-quality pictures`,
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		keywords: 'mfoni, Mfoni, report, report content',
	})
}

export default ReportContentsModule
