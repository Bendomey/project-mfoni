import {CollectionsModule} from '@/modules/index.ts'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Collections | mfoni'},
    {
      name: 'description',
      content: 'Explore all collections on mfoni',
    },
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default CollectionsModule
