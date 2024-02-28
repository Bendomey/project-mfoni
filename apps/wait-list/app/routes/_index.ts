import {type MetaFunction} from '@remix-run/node'
import {LandingPageModule} from '@/modules/index.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Home | mfoni'},
    {name: 'description', content: 'Welcome to mfoni!'},
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default LandingPageModule
