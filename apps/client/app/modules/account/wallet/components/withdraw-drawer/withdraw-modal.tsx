import { Dialog } from '@headlessui/react'
import { BanknotesIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { useInitiateTransfer } from '@/api/transfers/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { classNames } from '@/lib/classNames.ts'
import { errorToast } from '@/lib/custom-toast-functions.tsx'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	isOpened: boolean
	onClose: () => void
	recipient: TransferRecipient
}

interface FormValues {
	amount: number
}

export function WithdrawModal({ isOpened, onClose, recipient }: Props) {
	const [isPending, setIsPending] = useState(false)
	const { currentUser } = useAuth()
	const { mutate } = useInitiateTransfer()

	const yourFundInCedis = convertPesewasToCedis(currentUser?.bookWallet ?? 0)

	const schema = useMemo(
		() =>
			Yup.object().shape({
				amount: Yup.number()
					.typeError('Amount must be a number')
					.max(yourFundInCedis, `Amount must be less than ${yourFundInCedis}`)
					.required('Amount is required'),
			}),
		[yourFundInCedis],
	)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
	})

	const onSubmit = (data: FormValues) => {
		setIsPending(true)
		mutate(
			{
				amount: data.amount,
				transferRecipientId: recipient.id,
			},
			{
				onSuccess() {
					window.location.reload()
				},
				onError() {
					setIsPending(false)
					errorToast('Unable to initiate transfer', {
						id: 'withdraw-funds-error',
					})
				},
			},
		)
	}

	return (
		<Modal
			className="w-full sm:w-1/2 lg:w-1/3"
			isOpened={isOpened}
			onClose={onClose}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Dialog.Title
					as="h3"
					className="font-shantell text-lg font-medium leading-6 text-gray-900"
				>
					Withdraw Funds
				</Dialog.Title>
				<div className="mt-2">
					<p className="text-sm text-gray-500">
						You're sending money to your <b>{recipient.bankName}</b> account
						with number <b>{recipient.accountNumber}</b>.
					</p>

					<div className="mt-4 flex items-center space-x-3 bg-gray-50 p-3">
						<div>
							<BanknotesIcon className="h-10 w-auto text-gray-400" />
						</div>
						<div>
							<p className="text-sm">Available Funds</p>
							<h1 className="text-2xl font-extrabold">
								{formatAmount(yourFundInCedis)}
							</h1>
						</div>
					</div>

					<div className="mt-3">
						<div className="flex justify-between">
							<label
								htmlFor="amount"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Amount
							</label>
						</div>
						<div className="relative mt-2">
							<input
								type="number"
								step={0.01}
								{...register('amount')}
								className={classNames(
									'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
									errors.amount ? 'ring-red-500' : '',
								)}
								placeholder="eg. 0.00"
							/>
							{errors.amount ? (
								<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
									<ExclamationCircleIcon
										className="h-5 w-5 text-red-500"
										aria-hidden="true"
									/>
								</div>
							) : null}
						</div>
						{errors.amount ? (
							<p className="mt-1 text-xs text-red-600">
								{errors.amount.message}
							</p>
						) : null}
					</div>
				</div>

				<div className="mt-4">
					<Button variant="solid" color="primaryGhost" type="submit">
						Initiate
					</Button>
					<Button
						variant="outlined"
						type="button"
						className="ml-2"
						onClick={onClose}
					>
						Close
					</Button>
				</div>

				{isPending ? (
					<div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/40">
						<Loader color="fill-white" />
					</div>
				) : null}
			</form>
		</Modal>
	)
}
