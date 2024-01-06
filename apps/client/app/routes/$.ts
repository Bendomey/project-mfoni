import {type MetaFunction} from '@remix-run/node'
import {NotFoundModule} from '@/modules/index.tsx'

export const meta: MetaFunction = () => {
  return [
    {title: 'Page Not Found | ProjectMfoni'},
    {name: 'description', content: 'Welcome to ProjectMfoni!'},
    {name: 'keywords', content: 'ProjectMfoni, Mfoni'},
  ]
}

export default NotFoundModule
