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

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
	return getSocialMetas({
		title: 'Report Content | mfoni',
		description: 'Help Keep Our Platform Safe',
		url: getDisplayUrl({
			origin: data?.origin ?? 'https://mfoni.app',
			path: location.pathname,
		}),
		origin: data?.origin,
		keywords: 'report, report content',
	})
}

export default ReportContentsModule
