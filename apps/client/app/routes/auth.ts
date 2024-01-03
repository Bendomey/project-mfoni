import {type MetaFunction} from '@remix-run/node'
import {LoginModule} from '@/modules/index.tsx'

export const meta: MetaFunction = () => {
  return [
    {title: 'Login | ProjectMfoni'},
    {name: 'description', content: 'Login to your account'},
  ]
}

export function loader() {
  // process.env is available here because loader runs only on the server side
  return {
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID
  };
}

export default LoginModule
