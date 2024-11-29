import { Header } from '@/components/layout/index.ts'
import { Footer } from '@/components/footer/index.tsx'
import { PackageCard } from './components/package-card.tsx'
import { PaymentMethodCard } from './components/payment-method-card.tsx'
import { BillingsTable } from './components/billings-table.tsx'
import { Button } from '@/components/button/index.tsx'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useLoaderData } from '@remix-run/react'
import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query'
import { PackageAndBillingsProvider, usePackageAndBillingsContext } from './context/index.tsx'
import { ChangePackageModal } from './components/change-package-modal/index.tsx'

const PackageAndBillingsPage = () => {
  const { isChangePackageModalOpened } = usePackageAndBillingsContext()

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="px-4 lg:px-20 bg-gray-50 py-10">
        <div className="mb-10">
          <Button isLink href="/account" variant="unstyled" className="mb-2">
            <ChevronLeftIcon className="h-4 w-auto" />
            My Account
          </Button>
          <h1 className="font-semibold text-2xl">Package and billings</h1>
          <p className="text-sm mt-1 text-gray-600">
            Manage your package and billing details.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="col-span-4">
            <PackageCard />
          </div>
          <div className="col-span-3">
            <PaymentMethodCard />
          </div>
        </div>

        <div className="mt-10">
          <BillingsTable />
        </div>
      </div>
      <Footer />
      <ChangePackageModal isOpened={isChangePackageModalOpened} />
    </>
  )
}

export const PackageAndBillingsModule = () => {
  const loaderData = useLoaderData<{
    dehydratedState: DehydratedState
  }>()

  return (
    <HydrationBoundary state={loaderData.dehydratedState}>
      <PackageAndBillingsProvider>
        <PackageAndBillingsPage />
      </PackageAndBillingsProvider>
    </HydrationBoundary>
  )
}
