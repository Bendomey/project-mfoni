import {type MetaFunction} from '@remix-run/node'
import {OnboardingModule} from '@/modules/index.tsx'

export const meta: MetaFunction = () => {
  return [
    {title: 'Onboarding | ProjectMfoni'},
    {name: 'description', content: 'What is your primary goal?'},
  ]
}

export default OnboardingModule
