import {type MetaFunction} from '@remix-run/node'
import {LearnMoreModule} from '@/modules/index.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Learn more | mfoni'},
    {name: 'description', content: 'Welcome to mfoni!'},
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default LearnMoreModule
