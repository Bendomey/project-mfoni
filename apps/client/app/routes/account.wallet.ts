import {WalletModule} from '@/modules/index.ts'
import {
  type MetaFunction,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {protectRouteLoader} from '@/lib/actions/protect-route-loader.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Your Wallet | mfoni'},
    {name: 'description', content: 'Manage your e-wallet and its transactions here on mfoni'},
    {name: 'keywords', content: 'mfoni'},
  ]
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs)
  if (!res) {
    return {}
  }

  return res
}

export default WalletModule
