import {
	ExclamationCircleIcon,
	FolderPlusIcon,
	WalletIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { Pagination } from '@/components/pagination/index.tsx'
import { classNames } from '@/lib/classNames.ts'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'

interface Props {
	data?: FetchMultipleDataResponse<WalletTransaction>
	isError?: boolean
}

export function WalletTransactionsTable({ data, isError }: Props) {
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
						<div className="relative">
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
											Created On
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
														{formatAmount(
															convertPesewasToCedis(transaction.amount),
														)}
													</td>
													<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
														{dayjs(transaction.createdAt).format('ll')}
													</td>
												</tr>
											))}
										</>
									) : null}
								</tbody>
							</table>
							{!data || isError ? (
								<div className="py-20 text-center">
									<ExclamationCircleIcon className="mx-auto h-12 w-auto text-red-400" />
									<h3 className="mt-2 text-sm font-semibold text-gray-900">
										Transactions failed to fetch.
									</h3>
									<p className="mt-1 px-10 text-sm text-gray-500">
										Try again later.
									</p>
								</div>
							) : data.rows.length === 0 ? (
								<div className="py-20 text-center">
									<FolderPlusIcon className="mx-auto h-12 w-auto text-gray-400" />
									<h3 className="mt-2 text-sm font-semibold text-gray-900">
										No transactions found.
									</h3>
									<p className="mt-1 px-10 text-sm text-gray-500">
										Get started by making some deposits/withdrawals on your
										account.
									</p>
								</div>
							) : null}
						</div>
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
