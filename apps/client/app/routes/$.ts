import {type MetaFunction} from '@remix-run/node'
import {NotFoundModule} from '@/modules/index.tsx'

export const meta: MetaFunction = () => {
  return [
    {title: 'Page Not Found | mfoni'},
    {name: 'description', content: 'Welcome to mfoni!'},
    {name: 'keywords', content: 'mfoni, Mfoni'},
  ]
}

export default NotFoundModule
