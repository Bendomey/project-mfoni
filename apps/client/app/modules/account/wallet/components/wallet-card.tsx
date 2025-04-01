import { lazy } from 'react'
import { DepositButton } from './deposit-button.tsx'
import { Button } from '@/components/button/index.tsx'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { useAuth } from '@/providers/auth/index.tsx'

const WithdrawDrawer = lazy(() => import('./withdraw-drawer/index.tsx'))

export function WalletCard() {
	const { currentUser } = useAuth()
	const walletModalState = useDisclosure()

	return (
		<>
			<div className="rounded-lg border border-gray-200 bg-white">
				<div className="p-5">
					<div className="flex flex-col items-start justify-between gap-2 md:flex-row">
						<div className="flex w-full flex-col gap-1 md:w-2/3">
							<div className="flex items-center gap-3">
								<div className="rounded-md border border-gray-200 px-2">
									<span className="text-xs font-bold text-blue-600">MFONI</span>
								</div>
								<h1 className="text-sm font-bold">My Wallet</h1>
							</div>
							<p className="text-xs text-gray-500">
								This wallet is your default payment method for all purchases on
								this website.
							</p>
						</div>
						<div className="flex items-end gap-1">
							<h1 className="text-3xl font-bold">
								{formatAmount(convertPesewasToCedis(currentUser?.wallet ?? 0))}
							</h1>
						</div>
					</div>
				</div>

				<div className="mt-3 flex justify-end gap-2 border-t border-gray-200 px-4 py-2">
					<DepositButton />
					<Button onClick={walletModalState.onOpen} className="gap-1">
						Withdraw
					</Button>
				</div>
			</div>
			<WithdrawDrawer
				isOpened={walletModalState.isOpened}
				onClose={walletModalState.onClose}
			/>
		</>
	)
}
