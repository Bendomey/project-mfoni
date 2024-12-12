import { Button } from '@/components/button/index.tsx'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export function PaymentMethodCard() {
	const { currentUser } = useAuth()
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-5">
			<div className="flex flex-col gap-1">
				<h1 className="font-bold">Payment Method</h1>
				<p className="text-xs text-gray-500">
					Change how you play for your plan.
				</p>
			</div>

			<div className="mt-5">
				<div className="mb-2 flex gap-2 md:hidden">
					<Button size="sm" isLink href="/account/wallet">
						Topup
					</Button>
					<Button size="sm" disabled variant="outlined">
						Edit
					</Button>
				</div>
				<div className="flex items-start justify-between rounded-md border border-gray-100 p-3">
					<div className="flex items-start gap-3">
						<div className="rounded-md border border-gray-200 px-2 py-1">
							<span className="text-xs font-bold text-blue-600">MFONI</span>
						</div>
						<div>
							<div className="flex items-center gap-1">
								<h1 className="text-sm font-bold">My Wallet</h1>
								<span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-gray-900 ring-1 ring-inset ring-gray-500">
									Default
								</span>
							</div>
							<div className="mt-1">
								<span className="font-light">
									{formatAmount(
										convertPesewasToCedis(currentUser?.wallet ?? 0),
									)}
								</span>
							</div>
						</div>
					</div>
					<div className="hidden gap-2 md:flex">
						<Button size="sm" isLink href="/account/wallet">
							Topup
						</Button>
						<Button size="sm" disabled variant="outlined">
							Edit
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
