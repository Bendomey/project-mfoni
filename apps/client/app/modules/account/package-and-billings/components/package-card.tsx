import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { ArrowUpRightIcon } from '@heroicons/react/24/solid'
import { usePackageAndBillingsContext } from '../context/index.tsx'
import { CancelSubscriptionDialog } from './cancel-subscription-dialog.tsx'
import { ReactivateSubscriptionDialog } from './reactivate-subscription-dialog.tsx'
import { useIsSubscriptionPendingDowngrade } from '@/api/subscriptions/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Image } from '@/components/Image.tsx'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export function PackageCard() {
	const { isOpened, onToggle } = useDisclosure()
	const {
		isOpened: isOpenedReactivateModal,
		onToggle: onToggleReactivateModal,
	} = useDisclosure()
	const {
		isActiveSubscriptionCancelled,
		activePackage,
		setIsChangePackageModalOpened,
		isActiveSubscriptionCancelledRequestPending,
	} = usePackageAndBillingsContext()

	const { activeSubcription } = useAuth()
	const subscriptionId = safeString(activeSubcription?.id)
	const { data: subscriptionPendingDowngrade } =
		useIsSubscriptionPendingDowngrade(subscriptionId)

	return (
		<>
			<div className="rounded-lg border border-gray-200 bg-white">
				<div className="p-5">
					<div className="flex items-end justify-between">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-2">
								<h1 className="font-bold">{activePackage?.name}</h1>
								<span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
									<svg
										viewBox="0 0 6 6"
										aria-hidden="true"
										className="size-1.5 fill-blue-500"
									>
										<circle r={3} cx={3} cy={3} />
									</svg>
									Active
								</span>
							</div>
							<p className="text-xs text-gray-500">
								Our most popular plan for starters
							</p>
						</div>
						<div className="hidden items-end gap-1 md:flex">
							<h1 className="text-3xl font-bold">
								{formatAmount(
									convertPesewasToCedis(activePackage?.amount ?? 0),
								)}
							</h1>
							<span className="text-sm text-gray-500">per month</span>
						</div>
					</div>

					<div className="mt-5">
						<div className="flex -space-x-1 overflow-hidden">
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
							<Image
								alt=""
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								className="inline-block size-6 rounded-full ring-2 ring-white"
							/>
						</div>
					</div>
				</div>
				<div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-2">
					{isActiveSubscriptionCancelledRequestPending ? null : (
						<>
							{activePackage?.id !== 'FREE' &&
							!isActiveSubscriptionCancelled ? (
								<Button
									onClick={onToggle}
									variant="solid"
									color="danger"
									className="gap-1"
								>
									Cancel Subscription
								</Button>
							) : null}

							{activePackage?.id !== 'FREE' && isActiveSubscriptionCancelled ? (
								<Button
									onClick={onToggleReactivateModal}
									variant="solid"
									color="success"
									className="gap-1"
								>
									Re-activate Subscription
								</Button>
							) : null}
						</>
					)}

					{Boolean(subscriptionPendingDowngrade) ? null : (
						<Button
							variant="outlined"
							className="gap-1"
							onClick={() => setIsChangePackageModalOpened(true)}
						>
							{activePackage?.id === 'ADVANCED' ? (
								<>
									Change
									<ArrowPathIcon className="h-3 w-auto" />
								</>
							) : (
								<>
									Upgrade
									<ArrowUpRightIcon className="h-3 w-auto" />
								</>
							)}
						</Button>
					)}
				</div>
			</div>
			<CancelSubscriptionDialog isOpened={isOpened} onClose={onToggle} />
			<ReactivateSubscriptionDialog
				isOpened={isOpenedReactivateModal}
				onClose={onToggleReactivateModal}
			/>
		</>
	)
}
