import { useQueryClient } from '@tanstack/react-query'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useCreateCollection } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	onToggle: () => void
	isOpened: boolean
}

interface Inputs {
	name: string
	description: string
}

export function CreateCollectionModal({ isOpened, onToggle }: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<Inputs>()
	const queryClient = useQueryClient()
	const { currentUser } = useAuth()
	const { mutate, isPending, } = useCreateCollection()
	const onSubmit: SubmitHandler<Inputs> = (data) =>
		mutate(
			{
				name: data.name,
				description: data.description,
				visibility: 'PRIVATE',
			},
			{
				onError: () => {
					errorToast('Adding the collection failed. Try again.')
				},
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: [QUERY_KEYS.COLLECTIONS, currentUser?.id],
					})
					successToast('Collection added successfully.')
					onToggle()
					reset()
				},
			},
		)

	return (
		<Modal
			className="relative w-full p-0 md:w-3/6 lg:w-4/12"
			onClose={onToggle}
			isOpened={isOpened}
		>
			<div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
				<h1 className="font-bold">Create Collection</h1>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="m-3 space-y-4">
				<div>
					<label
						htmlFor="name"
						className="block text-sm/6 font-medium text-gray-900"
					>
						Name
					</label>
					<div className="mt-1">
						<input
							type="text"
							aria-invalid={errors.name ? 'true' : 'false'}
							aria-describedby={errors.name ? 'name-error' : undefined}
							{...register('name', { required: true })}
							className={classNames(
								'block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6',
								{
									'text-red-900 outline-red-300 placeholder:text-red-300 focus:outline-red-600':
										errors.name,
								},
							)}
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="description"
						className="block text-sm/6 font-medium text-gray-900"
					>
						Description
					</label>
					<div className="mt-1 grid grid-cols-1">
						<textarea
							aria-invalid={errors.description ? 'true' : 'false'}
							rows={5}
							aria-describedby={
								errors.description ? 'description-error' : undefined
							}
							{...register('description', { required: true })}
							className={classNames(
								'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6',
								{
									'text-red-900 outline-red-300 placeholder:text-red-300 focus:outline-red-600':
										errors.description,
								},
							)}
						></textarea>
					</div>
				</div>

				<div className="flex flex-row items-center justify-end gap-2">
					<Button
						variant="outlined"
						onClick={() => {
							onToggle()
							reset()
						}}
						className="mt-5"
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending} className="mt-5">
						{isPending ? 'Creating' : 'Create'}
					</Button>
				</div>
			</form>
		</Modal>
	)
}
