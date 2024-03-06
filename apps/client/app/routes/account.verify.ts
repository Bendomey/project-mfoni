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
    SMILEID_ENVIRONMENT: process.env.SMILEID_ENVIRONMENT,
    SMILEID_PARTNER_ID: process.env.SMILEID_PARTNER_ID,
    API_ADDRESS: process.env.API_ADDRESS,
  }
}

export default VerifyAccountModule
