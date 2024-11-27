import {WalletModule} from '@/modules/index.ts'
import {type MetaFunction, type LoaderFunctionArgs} from '@remix-run/node'
import {protectRouteLoader} from '@/lib/actions/protect-route-loader.ts'
import {dehydrate, QueryClient} from '@tanstack/react-query'
import {QUERY_KEYS} from '@/constants/index.ts'
import {getWalletTransactions} from '@/api/wallet-transactions/index.ts'
import {extractAuthCookie} from '@/lib/actions/extract-auth-cookie.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Your Wallet | mfoni'},
    {
      name: 'description',
      content: 'Manage your e-wallet and its transactions here on mfoni',
    },
    {name: 'keywords', content: 'mfoni'},
  ]
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs)
  if (!res) {
    const queryClient = new QueryClient()
    const searchParams = new URL(loaderArgs.request.url).searchParams
    const page = searchParams.get('page') ?? '0'
    const authToken = await extractAuthCookie(
      loaderArgs.request.headers.get('cookie'),
    )
    const baseUrl = `${process.env.API_ADDRESS}/api`

    if (authToken) {
      await queryClient.prefetchQuery({
        queryKey: [
          QUERY_KEYS.WALLET_TRANSACTIONS,
          {pagination: {page: Number(page), per: 50}},
        ],
        queryFn: () =>
          getWalletTransactions(
            {pagination: {page: Number(page), per: 50}},
            {
              authToken,
              baseUrl,
            },
          ),
      })
    }

    const dehydratedState = dehydrate(queryClient)
    return {
      dehydratedState,
    }
  }

  return res
}

export default WalletModule
