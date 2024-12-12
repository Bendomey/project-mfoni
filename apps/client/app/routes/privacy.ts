import { type MetaFunction } from '@remix-run/node'
import { PolicyModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Privacy Policy | mfoni' },
		{ name: 'description', content: 'Welcome to mfoni!' },
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export default PolicyModule
