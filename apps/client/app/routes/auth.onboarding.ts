import { type MetaFunction } from '@remix-run/node'
import { protectRouteLoader } from '@/lib/actions/protect-route-loader.ts'
import { OnboardingModule } from '@/modules/index.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Onboarding | mfoni' },
		{ name: 'description', content: 'What is your primary goal?' },
	]
}

export const loader = protectRouteLoader

export default OnboardingModule
