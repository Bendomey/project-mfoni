import { type MetaFunction } from '@remix-run/node'
import { SearchModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Search | mfoni' },
		{
			name: 'description',
			content: 'Search for content on mfoni',
		},
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export default SearchModule
