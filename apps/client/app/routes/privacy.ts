import {PolicyModule} from '@/modules/index.tsx'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'Privacy Policy | ProjectMfoni'},
    {name: 'description', content: 'Welcome to ProjectMfoni!'},
    {name: 'keywords', content: 'ProjectMfoni, Mfoni'},
  ]
}

export default PolicyModule
