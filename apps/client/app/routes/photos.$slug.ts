import {PhotoModule} from '@/modules/index.ts'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Content | mfoni'},
    {
      name: 'description',
      content:
        'Description of the content. Maybe put in some tags of the content',
    },
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default PhotoModule
