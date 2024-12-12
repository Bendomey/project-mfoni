import { type MetaFunction } from '@remix-run/node'
import { TermsModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Terms | mfoni' },
		{ name: 'description', content: 'Welcome to mfoni!' },
		{ name: 'keywords', content: 'mfoni, Mfoni' },
	]
}

export default TermsModule
