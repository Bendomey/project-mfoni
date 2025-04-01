import { Dialog } from '@headlessui/react'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
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
}

interface FormValues {
	amount: number
}

const schema = Yup.object().shape({
	amount: Yup.number().required('Amount is required'),
})

const isPending = false
export function WithdrawModal({ isOpened, onClose }: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
	})

	const onSubmit = () => {}

	return (
		<Modal className="w-1/3" isOpened={isOpened} onClose={onClose}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mb-3 flex justify-center">
					<span className="inline-block h-14 w-14 overflow-hidden rounded-full bg-gray-100">
						<svg
							className="h-full w-full text-gray-300"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					</span>
				</div>
				<Dialog.Title
					as="h3"
					className="text-center text-lg font-medium leading-6 text-gray-900"
				>
					Withdraw Funds
				</Dialog.Title>
				<div className="mt-2">
					<p className="text-center text-sm text-gray-500">
						Great news! You&apos;re almost there. Please complete your account
						setup to continue.
					</p>

					<div className="mt-3">
						<div className="flex justify-between">
							<label
								htmlFor="email"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Name
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
								placeholder="Your Name"
								aria-describedby="email-optional"
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
