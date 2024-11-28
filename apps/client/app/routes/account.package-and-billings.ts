import {PackageAndBillingsModule} from '@/modules/index.ts'
import {type MetaFunction, type LoaderFunctionArgs} from '@remix-run/node'
import {protectCreatorRouteLoader} from '@/lib/actions/protect-creator-route-loader.ts'
import {dehydrate, QueryClient} from '@tanstack/react-query'
import {extractAuthCookie} from '@/lib/actions/extract-auth-cookie.ts'
import {QUERY_KEYS} from '@/constants/index.ts'
import {getCreatorSubscriptions} from '@/api/subscriptions/index.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Package And Billings | mfoni'},
    {name: 'description', content: 'Manage your package and billings on mfoni'},
    {name: 'keywords', content: 'mfoni'},
  ]
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectCreatorRouteLoader(loaderArgs)
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
          QUERY_KEYS.CREATOR_SUBSCRIPTIONS,
          {pagination: {page: Number(page), per: 50}},
        ],
        queryFn: () =>
          getCreatorSubscriptions(
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

export default PackageAndBillingsModule
