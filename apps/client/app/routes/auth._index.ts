import { type MetaFunction } from '@remix-run/node'
import { LoginModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Login | mfoni' },
		{ name: 'description', content: 'Login to your account' },
	]
}

export default LoginModule
