import {Header} from '@/components/layout/index.ts'
import {Footer} from '@/components/footer/index.tsx'
import {WalletTransactionsTable} from './components/transactions-table.tsx'
import {WalletCard} from './components/wallet-card.tsx'
import {useLoaderData, useSearchParams} from '@remix-run/react'
import {HydrationBoundary, type DehydratedState} from '@tanstack/react-query'
import {useGetWalletTransactions} from '@/api/wallet-transactions/index.ts'
import {ChevronLeftIcon} from '@heroicons/react/24/outline'
import {Button} from '@/components/button/index.tsx'

const WalletPage = () => {
  const [searchParams] = useSearchParams()
  const page = searchParams.get('page') ?? '0'
  const {data, isError} = useGetWalletTransactions({
    pagination: {
      page: Number(page),
      per: 50,
    },
  })

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="px-4 lg:px-20 bg-gray-50 py-10">
        <div className="mb-10">
          <Button isLink href="/account" variant="unstyled" className="mb-2">
            <ChevronLeftIcon className="h-4 w-auto" />
            My Account
          </Button>
          <h1 className="font-semibold text-2xl">My Wallet</h1>
          <p className="text-sm mt-1 text-gray-600">
            Manage my wallet and transaction details.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WalletCard />
        </div>

        <div className="mt-10">
          <WalletTransactionsTable data={data} isError={isError} />
        </div>
      </div>
      <Footer />
    </>
  )
}
export const WalletModule = () => {
  const loaderData = useLoaderData<{
    dehydratedState: DehydratedState
  }>()

  return (
    <HydrationBoundary state={loaderData.dehydratedState}>
      <WalletPage />
    </HydrationBoundary>
  )
}
