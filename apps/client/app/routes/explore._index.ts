import { redirect, type MetaFunction } from '@remix-run/node'
import { getExploreSections } from '@/api/explore/index.ts'
import { PAGES } from '@/constants/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { jsonWithCache } from '@/lib/actions/json-with-cache.server.ts'
import { ExploreModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Explore | mfoni' },
		{ name: 'description', content: 'Welcome to mfoni!' },
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export async function loader() {
	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	try {
		const exploreSections = await getExploreSections(
			{
				sorter: {
					sort: 'asc',
					sortBy: 'sort',
				},
				pagination: {
					page: 0,
					per: 50,
				},
			},
			{
				baseUrl,
			},
		)

		if (exploreSections) {
			return jsonWithCache({
				exploreSections,
			})
		}
		return redirect(PAGES.NOT_FOUND)
	} catch (error: unknown) {
		return redirect(PAGES.NOT_FOUND)
	}
}

export default ExploreModule
