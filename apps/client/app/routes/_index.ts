import {type MetaFunction} from '@remix-run/node'
import {LandingPageModule} from '@/modules/index.tsx'

export const meta: MetaFunction = () => {
  return [
    {title: 'Home | mfoni'},
    {name: 'description', content: 'Welcome to mfoni!'},
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default LandingPageModule
