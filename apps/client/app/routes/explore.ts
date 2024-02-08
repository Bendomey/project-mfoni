import {ExploreModule} from '@/modules/explore/index.tsx'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Explore | mfoni'},
    {name: 'description', content: 'Welcome to mfoni!'},
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default ExploreModule
