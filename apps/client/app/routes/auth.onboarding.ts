import {type MetaFunction} from '@remix-run/node'
import {OnboardingModule} from '@/modules/index.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Onboarding | mfoni'},
    {name: 'description', content: 'What is your primary goal?'},
  ]
}

export default OnboardingModule
