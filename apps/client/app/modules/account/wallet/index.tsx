import { Header } from '@/components/layout/index.ts'
import { Footer } from '@/components/footer/index.tsx'
import { WalletTransactionsTable } from './components/transactions-table.tsx'
import { WalletCard } from './components/wallet-card.tsx'

export const WalletModule = () => {

    return (
        <>
            <Header isHeroSearchInVisible={false} />
            <div className="px-4 lg:px-20 bg-gray-50 py-10">
                <div className='mb-10'>
                    <h1 className='font-semibold text-2xl'>My Wallet</h1>
                    <p className='text-sm mt-1 text-gray-600'>Manage my wallet and transaction details.</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <WalletCard />
                </div>

                <div className='mt-10'>
                    <WalletTransactionsTable />
                </div>
            </div>
            <Footer />
        </>
    )
}
