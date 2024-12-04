import {CollectionModule} from '@/modules/index.ts'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Collection | mfoni'},
    {
      name: 'description',
      content: 'Explore all collection contents on mfoni',
    },
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default CollectionModule
