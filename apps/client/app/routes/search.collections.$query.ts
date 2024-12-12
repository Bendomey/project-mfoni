import { type MetaFunction } from '@remix-run/node'
import { SearchCollectionsModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Search Collections | mfoni' },
		{
			name: 'description',
			content: 'Search for collections on mfoni',
		},
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export default SearchCollectionsModule
