import {UploadModule} from '@/modules/index.tsx'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Upload | mfoni'},
    {name: 'description', content: 'Upload your contents to the world'},
  ]
}

export default UploadModule
