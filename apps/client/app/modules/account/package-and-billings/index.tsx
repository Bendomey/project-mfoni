import { Header } from '@/components/layout/index.ts'
import { Footer } from '@/components/footer/index.tsx'
import { PackageCard } from './components/package-card.tsx'
import { PaymentMethodCard } from './components/payment-method-card.tsx'
import { BillingsTable } from './components/billings-table.tsx'

export const PackageAndBillingsModule = () => {

    return (
        <>
            <Header isHeroSearchInVisible={false} />
            <div className="px-4 lg:px-20 bg-gray-50 py-10">
                <div className='mb-10'>
                    <h1 className='font-semibold text-2xl'>Package and billings</h1>
                    <p className='text-sm mt-1 text-gray-600'>Manage your package and billing details.</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <PackageCard />
                        <PaymentMethodCard />
                </div>
                
                <div className='mt-10'>
                    <BillingsTable />
                </div>
            </div>
            <Footer />
        </>
    )
}
