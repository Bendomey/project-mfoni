import {SearchCreatorsModule} from '@/modules/index.ts'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Search Creators | mfoni'},
    {
      name: 'description',
      content: 'Search for creators on mfoni',
    },
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default SearchCreatorsModule
