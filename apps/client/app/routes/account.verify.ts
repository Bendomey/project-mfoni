import {VerifyAccountModule} from '@/modules/index.ts'
import {type MetaFunction, type LinksFunction} from '@remix-run/node'
import styles from '@/modules/account/verify/components/verify-phone-step/pin-code.css'

export const meta: MetaFunction = () => {
  return [
    {title: 'Verify Account | mfoni'},
    {name: 'description', content: 'Welcome to mfoni!'},
    {name: 'keywords', content: 'mfoni'},
  ]
}

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}]

export function loader() {
  return {
    METRIC_CLIENT_ID: process.env.METRIC_CLIENT_ID,
    METRIC_CLIENT_SECRET: process.env.METRIC_CLIENT_SECRET,
  }
}

export default VerifyAccountModule
