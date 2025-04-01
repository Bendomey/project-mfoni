import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { CreditCardIcon } from '@heroicons/react/24/solid'
import { useQueryClient } from '@tanstack/react-query'
import { WithdrawModal } from './withdraw-modal.tsx'
import {
	useDeleteTransferRecipient,
	useGetTransferRecipients,
} from '@/api/transfers/index.ts'
import { Button } from '@/components/button/index.tsx'
import { EmptyLottie } from '@/components/lotties/empty.tsx'
import { ErrorLottie } from '@/components/lotties/error.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast } from '@/lib/custom-toast-functions.tsx'

interface Props {
	addNew: () => void
}

export function AccountsListing({ addNew }: Props) {
	const { data, isPending, isError } = useGetTransferRecipients({
		pagination: {
			page: 0,
			per: 50,
		},
	})

	if (isPending) {
		return (
			<div className="m-4 space-y-3">
				{[1, 2, 3, 4, 5].map((_, index) => (
					<div
						className="flex w-full items-center justify-between bg-gray-50 p-2"
						key={index}
					>
						<div className="flex items-center space-x-2">
							<div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
							<div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
						</div>
						<div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
					</div>
				))}
			</div>
		)
	}

	if (isError) {
		return <ErrorState retry={addNew} />
	}

	if (!data?.rows.length) {
		return <EmptyState addNew={addNew} />
	}

	return (
		<ul
			role="list"
			className="scrollContainer mr-.5 flex-1 divide-y divide-gray-200 overflow-y-auto"
		>
			{data.rows.map((recipient) => (
				<li key={recipient.id}>
					<RecipientItem recipient={recipient} />
				</li>
			))}
		</ul>
	)
}

interface RecipientItemProps {
	recipient: TransferRecipient
}

function RecipientItem({ recipient }: RecipientItemProps) {
	const deleteModalState = useDisclosure()
	const payModalState = useDisclosure()
	return (
		<>
			<div className="group relative flex items-center px-5 py-6">
				<div className="-m-1 block flex-1 p-1">
					<div className="flex min-w-0 flex-1 items-center">
						{recipient.bankCode === 'VOD' ? (
							<img
								alt="telecel logo"
								src="/images/vodafone.png"
								className="h-auto w-10"
							/>
						) : recipient.bankCode === 'MTN' ? (
							<img
								alt="mtn logo"
								src="/images/mtn_logo.png"
								className="h-auto w-10"
							/>
						) : recipient.bankCode === 'ATL' ? (
							<img
								alt="airtel tigo logo"
								src="/images/airtel_tigo.png"
								className="h-auto w-10"
							/>
						) : (
							<CreditCardIcon className="size-8 text-gray-300" />
						)}
						<div className="ml-4 w-10/12">
							<p className="text-sm font-medium capitalize text-gray-900">
								{recipient.accountName.toLowerCase()}{' '}
								{recipient.type === 'ghipss' ? `(${recipient.bankName})` : ''}
							</p>
							<p className="text-sm text-gray-500">{recipient.accountNumber}</p>
						</div>
					</div>
				</div>
				<Button onClick={payModalState.onOpen} size="sm" className="relative">
					Pay
				</Button>
				<Menu
					as="div"
					className="relative ml-2 inline-block shrink-0 text-left"
				>
					<MenuButton className="group relative inline-flex size-8 items-center justify-center rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
						<span className="absolute -inset-1.5" />
						<span className="sr-only">Open options menu</span>
						<span className="flex size-full items-center justify-center rounded-full">
							<EllipsisVerticalIcon
								aria-hidden="true"
								className="size-5 text-gray-400 group-hover:text-gray-500"
							/>
						</span>
					</MenuButton>
					<MenuItems
						transition
						className="absolute right-9 top-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
					>
						<div className="py-1">
							<MenuItem>
								<button
									onClick={deleteModalState.onOpen}
									className="block w-full px-4 py-2 text-start text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
								>
									Delete
								</button>
							</MenuItem>
						</div>
					</MenuItems>
				</Menu>
			</div>
			<DeleteRecipient
				isOpened={deleteModalState.isOpened}
				onClose={deleteModalState.onClose}
				recipient={recipient}
			/>
			<WithdrawModal
				isOpened={payModalState.isOpened}
				onClose={payModalState.onClose}
				recipient={recipient}
			/>
		</>
	)
}

function EmptyState({ addNew }: { addNew: () => void }) {
	return (
		<div className="py-20 text-center">
			<EmptyLottie />
			<h3 className="mt-2 text-sm font-semibold text-gray-900">
				No accounts found.
			</h3>
			<p className="mt-1 px-10 text-sm text-gray-500">
				Get started by adding a new account.
			</p>
			<div className="mt-4">
				<Button onClick={addNew} size="sm">
					Add Account
				</Button>
			</div>
		</div>
	)
}

function ErrorState({ retry }: { retry: () => void }) {
	return (
		<div className="py-20 text-center">
			<ErrorLottie />
			<h3 className="mt-2 text-sm font-semibold text-gray-900">
				Error fetching accounts.
			</h3>
			<p className="mt-1 px-10 text-sm text-gray-500">
				An error occurred while fetching your accounts.
			</p>
			<div className="mt-4">
				<Button onClick={retry} size="sm">
					Retry
				</Button>
			</div>
		</div>
	)
}

interface DeleteRecipientProps {
	isOpened: boolean
	onClose: () => void
	recipient: TransferRecipient
}

function DeleteRecipient({
	isOpened,
	onClose,
	recipient,
}: DeleteRecipientProps) {
	const queryClient = useQueryClient()
	const { mutate, isPending } = useDeleteTransferRecipient()
	const handleDelete = () => {
		mutate(recipient.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [QUERY_KEYS.TRANSFER_RECIPIENTS],
				})
				onClose()
			},
			onError: () => {
				errorToast('Unable to delete recipient', {
					id: 'delete-recipient-error',
				})
			},
		})
	}

	return (
		<Modal
			isOpened={isOpened}
			onClose={onClose}
			className="w-full p-0 sm:w-1/2 lg:w-1/4"
		>
			<div className="space-y-2">
				<div className="space-y-3 p-4">
					<h3 className="text-2xl font-semibold text-gray-900">
						Are you sure?
					</h3>
					<div>
						<i className="text-sm text-gray-500">
							Are you sure you want to delete this recipient?
						</i>
					</div>
				</div>
				<div className="flex justify-end space-x-2 border-t p-3">
					<Button onClick={onClose} variant="outlined">
						Cancel
					</Button>
					<Button onClick={handleDelete} disabled={isPending} color="danger">
						Delete
					</Button>
				</div>
			</div>
		</Modal>
	)
}
