import {PackageAndBillingsModule} from '@/modules/index.ts'
import {
  type MetaFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import styles from '@/modules/account/verify/components/verify-phone-step/pin-code.css'
import {protectRouteLoader} from '@/lib/actions/protect-route-loader.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Package And Billings | mfoni'},
    {name: 'description', content: 'Manage your package and billings on mfoni'},
    {name: 'keywords', content: 'mfoni'},
  ]
}

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}]

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs)
  if (!res) {
    return {}
  }

  return res
}

export default PackageAndBillingsModule
