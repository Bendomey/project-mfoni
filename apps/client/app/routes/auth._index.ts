import {type MetaFunction} from '@remix-run/node'
import {LoginModule} from '@/modules/index.tsx'

export const meta: MetaFunction = () => {
  return [
    {title: 'Login | ProjectMfoni'},
    {name: 'description', content: 'Login to your account'},
  ]
}

export function loader() {
  return {
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  }
}

export default LoginModule