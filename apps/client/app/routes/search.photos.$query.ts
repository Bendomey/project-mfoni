import { type MetaFunction } from '@remix-run/node'
import { SearchPhotosModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Search Photos | mfoni' },
		{
			name: 'description',
			content: 'Search for photos on mfoni',
		},
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export default SearchPhotosModule
