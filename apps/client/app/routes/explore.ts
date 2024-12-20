import { type MetaFunction } from '@remix-run/node'
import { ExploreModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Explore | mfoni' },
		{ name: 'description', content: 'Welcome to mfoni!' },
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export default ExploreModule
