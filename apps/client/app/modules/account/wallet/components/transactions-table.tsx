import {
	ExclamationCircleIcon,
	FolderPlusIcon,
	WalletIcon,
} from '@heroicons/react/24/outline'
import { BanknotesIcon } from '@heroicons/react/24/solid'
import dayjs from 'dayjs'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { Pagination } from '@/components/pagination/index.tsx'
import { classNames } from '@/lib/classNames.ts'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'

interface Props {
	data?: FetchMultipleDataResponse<WalletTransaction>
	isError?: boolean
	isLoading?: boolean
}

export function WalletTransactionsTable({ data, isError, isLoading }: Props) {
	let content = <></>

	if (isLoading) {
		content = (
			<div className="flex items-center justify-center py-20">
				<Loader />
			</div>
		)
	} else if (isError) {
		content = (
			<div className="py-20 text-center">
				<ExclamationCircleIcon className="mx-auto h-12 w-auto text-red-400" />
				<h3 className="mt-2 text-sm font-semibold text-gray-900">
					Transactions failed to fetch.
				</h3>
				<p className="mt-1 px-10 text-sm text-gray-500">Try again later.</p>
			</div>
		)
	} else if (data?.rows.length === 0) {
		content = (
			<div className="py-20 text-center">
				<FolderPlusIcon className="mx-auto h-12 w-auto text-gray-400" />
				<h3 className="mt-2 text-sm font-semibold text-gray-900">
					No transactions found.
				</h3>
				<p className="mt-1 px-10 text-sm text-gray-500">
					Get started by making some deposits/withdrawals on your account.
				</p>
			</div>
		)
	} else if (data?.rows.length) {
		content = (
			<table className="min-w-full table-fixed divide-y divide-gray-200 border-t border-gray-200">
				<thead>
					<tr>
						<th
							scope="col"
							className="min-w-[12rem] px-7 py-3.5 text-left text-xs font-semibold text-gray-900 sm:px-6"
						>
							Transaction
						</th>
						<th
							scope="col"
							className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
						>
							Amount
						</th>
						<th
							scope="col"
							className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
						>
							Status
						</th>
						<th
							scope="col"
							className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
						>
							Created On
						</th>
						<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
							<span className="sr-only">Actions</span>
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200 bg-white">
					{data?.rows.length ? (
						<>
							{data.rows.map((transaction) => (
								<tr key={transaction.id}>
									<td
										className={classNames(
											'flex items-center gap-1 whitespace-nowrap px-7 py-4 text-sm font-medium text-gray-900 sm:px-6',
										)}
									>
										<WalletIcon className="h-6 w-auto" />
										<span className="capitalize">
											{getReason(transaction.reasonForTransfer)}
										</span>
										{transaction.type === 'DEPOSIT' ? (
											<span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
												{transaction.type}
											</span>
										) : (
											<span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10">
												{transaction.type}
											</span>
										)}
									</td>
									<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
										{formatAmount(convertPesewasToCedis(transaction.amount))}
									</td>
									<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
										{getStatus(transaction.status)}
									</td>
									<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
										{dayjs(transaction.createdAt).format('L')}
									</td>
									<td className="flex whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
										<Button
											disabled={transaction.status !== 'PENDING'}
											variant="outlined"
											title="Download Receipt"
											className=""
										>
											<BanknotesIcon className="mr-1 h-4 w-auto text-gray-600" />
											Pay
										</Button>
									</td>
								</tr>
							))}
						</>
					) : null}
				</tbody>
			</table>
		)
	}
	return (
		<div className="rounded-md border border-gray-200 bg-white pb-1 pt-5">
			<div className="px-4 sm:flex sm:items-center sm:px-6 lg:px-5">
				<div className="sm:flex-auto">
					<h1 className="text-base font-semibold text-gray-900">
						Wallet transactions
					</h1>
					<p className="mt-1 text-sm text-gray-700">
						These are your wallet transactions that have happened in the past.
					</p>
				</div>
			</div>
			<div className="mt-5 flow-root">
				<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
						<div className="relative">{content}</div>
					</div>
				</div>
			</div>
			{data ? <Pagination data={data} /> : null}
		</div>
	)
}

function getReason(reason: string) {
	switch (reason) {
		case 'SUBSCRIPTION':
			return 'Subscription payment'
		case 'SUBSCRIPTION_REFUND':
			return 'Subscription refund'
		case 'CONTENT_PURCHASE':
			return 'Content purchase'
		case 'TOPUP':
			return 'Wallet top-up'
		default:
			return reason
	}
}

function getStatus(status: WalletTransaction['status']) {
	switch (status) {
		case 'PENDING':
			return (
				<span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
					Pending
				</span>
			)
		case 'FAILED':
			return (
				<span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
					Failed
				</span>
			)
		case 'CANCELLED':
			return (
				<span className="bg-organge-50 text-organge-700 ring-organge-700/10 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
					Cancelled
				</span>
			)
		case 'SUCCESSFUL':
			return (
				<span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
					Successful
				</span>
			)
		default:
			return (
				<span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
					Unknown
				</span>
			)
	}
}
