import {type MetaFunction} from '@remix-run/node'
import {LoginModule} from '@/modules/index.tsx'

export const meta: MetaFunction = () => {
  return [
    {title: 'Login | ProjectMfoni'},
    {name: 'description', content: 'Login to your account'},
  ]
}

export default LoginModule
