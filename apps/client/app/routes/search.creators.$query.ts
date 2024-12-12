import { type MetaFunction } from '@remix-run/node'
import { SearchCreatorsModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Search Creators | mfoni' },
		{
			name: 'description',
			content: 'Search for creators on mfoni',
		},
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export default SearchCreatorsModule
