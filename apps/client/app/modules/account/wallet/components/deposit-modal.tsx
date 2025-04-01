import { Dialog } from '@headlessui/react'
import { BanknotesIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { classNames } from '@/lib/classNames.ts'

interface Props {
	isOpened: boolean
	onClose: () => void
	onSubmit: (amount: number) => void
	isSubmitting?: boolean
}

interface FormValues {
	amount: number
}

const schema = Yup.object().shape({
	amount: Yup.number().required('Amount is required'),
})

export function DepositModal({
	isOpened,
	onClose,
	onSubmit,
	isSubmitting,
}: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
	})

	return (
		<Modal
			canBeClosedWithBackdrop={false}
			className="w-full md:w-1/3"
			isOpened={isOpened}
			onClose={onClose}
		>
			<form onSubmit={handleSubmit((values) => onSubmit(values.amount))}>
				<div className="mb-3 flex justify-center">
					<BanknotesIcon className="h-10 w-full text-blue-600" />
				</div>
				<Dialog.Title
					as="h3"
					className="text-center text-lg font-medium leading-6 text-gray-900"
				>
					Deposit Funds
				</Dialog.Title>
				<div className="mt-1">
					<p className="text-center text-sm text-gray-500">
						Enter the amount you want to deposit in <b>Ghana Cedis</b>.
					</p>

					<div className="mt-5">
						<div className="relative mt-2">
							<input
								step={0.01}
								{...register('amount')}
								className={classNames(
									'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
									errors.amount ? 'ring-red-500' : '',
								)}
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
					</div>
				</div>

				<div className="mt-4">
					<Button variant="solid" color="primary" type="submit">
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

				{isSubmitting ? (
					<div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/40">
						<Loader color="fill-white" />
					</div>
				) : null}
			</form>
		</Modal>
	)
}
