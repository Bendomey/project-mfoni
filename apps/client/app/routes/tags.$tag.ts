import {TagModule} from '@/modules/index.ts'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Tag | mfoni'},
    {
      name: 'description',
      content: 'Explore all tag contents on mfoni',
    },
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default TagModule
