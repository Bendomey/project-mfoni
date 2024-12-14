import { Transition, Dialog } from '@headlessui/react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { yupResolver } from '@hookform/resolvers/yup'
import { useSearchParams } from '@remix-run/react'
import { Fragment, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Image } from 'remix-image'
import * as Yup from 'yup'
import { useSetupAccount } from '@/api/auth/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { errorMessagesWrapper } from '@/constants/error-messages.ts'
import { useValidateImage } from '@/hooks/use-validate-image.tsx'
import { classNames } from '@/lib/classNames.ts'
import { errorToast } from '@/lib/custom-toast-functions.tsx'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	open: boolean
	onClose: () => void
	selectedType?: UserRole
}

interface FormValues {
	role: UserRole
	name: string
}

const schema = Yup.object().shape({
	role: Yup.string()
		.oneOf(['CLIENT', 'CREATOR'])
		.default('CLIENT')
		.required('Role is required'),
	name: Yup.string().required('Name is required'),
})

export const SetupAccountModal = ({ onClose, open, selectedType }: Props) => {
	const { isPending, mutate } = useSetupAccount()
	const { currentUser } = useAuth()
	const [searchParams] = useSearchParams()
	const isProfilePhotoValid = useValidateImage(currentUser?.photo ?? '')

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
	})

	useEffect(() => {
		if (currentUser) {
			setValue('name', currentUser.name)

			if (selectedType) {
				setValue('role', selectedType)
			}
		}
	}, [currentUser, selectedType, setValue])

	const onSubmit = (data: FormValues) => {
		mutate(
			{
				...data,
				intendedPricingPackage:
					searchParams.get('pricing_package') ?? undefined,
			},
			{
				onSuccess: async () => {
					window.location.href = searchParams.get('return_to') ?? '/'
				},
				onError: (error) => {
					errorToast(errorMessagesWrapper(error.message), {
						id: 'account-setup-error',
					})
				},
			},
		)
	}

	return (
		<Transition appear show={open} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={() => {}}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<form onSubmit={handleSubmit(onSubmit)}>
									<div className="mb-3 flex justify-center">
										{isProfilePhotoValid && currentUser?.photo ? (
											<Image
												className="inline-block h-14 w-14 rounded-full"
												src={currentUser.photo}
												alt={currentUser.name}
											/>
										) : currentUser?.name ? (
											<span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-400">
												<span className="text-xl font-medium leading-none text-white">
													{currentUser.name
														.split(' ')
														.map((n) => n[0]?.toUpperCase())
														.slice(0, 2)
														.join('')}
												</span>
											</span>
										) : (
											<span className="inline-block h-14 w-14 overflow-hidden rounded-full bg-gray-100">
												<svg
													className="h-full w-full text-gray-300"
													fill="currentColor"
													viewBox="0 0 24 24"
												>
													<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
												</svg>
											</span>
										)}
									</div>
									<Dialog.Title
										as="h3"
										className="text-center text-lg font-medium leading-6 text-gray-900"
									>
										Complete Account Setup
									</Dialog.Title>
									<div className="mt-2">
										<p className="text-center text-sm text-gray-500">
											Great news! You&apos;re almost there. Please complete your
											account setup to continue.
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
													type="text"
													{...register('name')}
													className={classNames(
														'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
														errors.name ? 'ring-red-500' : '',
													)}
													placeholder="Your Name"
													aria-describedby="email-optional"
												/>
												{errors.name ? (
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
											Save Changes!
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
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
