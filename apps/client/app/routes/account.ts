import {AccountModule} from '@/modules/index.tsx'
import {type MetaFunction} from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    {title: 'My Account | Mfoni'},
    {name: 'description', content: 'Welcome to Mfoni!'},
    {name: 'keywords', content: 'Mfoni'},
  ]
}

export default AccountModule
