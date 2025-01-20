import { yupResolver } from '@hookform/resolvers/yup'
import { useFetcher } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'

interface Inputs {
	title: string
}

const schema = Yup.object().shape({
	title: Yup.string().required('Title is required.'),
})

interface Props {
	isOpened: boolean
	closeModal: () => void
	title: string
	collectionId: string
}

export function EditCollectionTitleModal({
	isOpened,
	closeModal,
	title,
	collectionId,
}: Props) {
	const queryClient = useQueryClient()
	const fetcher = useFetcher<{ error: string; success: boolean }>()

	console.log(collectionId, title)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<Inputs>({
		resolver: yupResolver(schema),
	})

	useEffect(() => {
		if (title) {
			setValue('title', title)
		}
	}, [title, setValue])

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (fetcher?.data?.error) {
			errorToast(fetcher?.data.error, {
				id: 'error-collection-update',
			})
		}
	}, [fetcher?.data])

	useEffect(() => {
		if (fetcher?.data?.success && fetcher.state === 'idle') {
			successToast('Title updated successfully', {
				id: 'success-collection-update',
			})
			closeModal()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher])

	const onSubmit: SubmitHandler<Inputs> = (data) => {
		fetcher.submit(
			{
				collectionId,
				name: data.title,
			},
			{
				action: `/api/update-collection`,
				encType: 'multipart/form-data',
				method: 'patch',
				preventScrollReset: true,
			},
		)

		queryClient.invalidateQueries({
			queryKey: [QUERY_KEYS.COLLECTIONS],
		})
	}

	const isDisabled =
		watch('title') === title || fetcher.state !== 'idle' || !!errors.title

	return (
		<Modal
			onClose={closeModal}
			isOpened={isOpened}
			className="relative w-full p-0 md:w-3/6 lg:w-2/6"
			canBeClosedWithBackdrop={false}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div>
					<div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
						<h1 className="font-bold">Edit Collection Title</h1>
					</div>
					<div className="m-5">
						<div className="mt-2">
							<input
								id="title"
								type="text"
								{...register('title')}
								placeholder="Title"
								className={classNames(
									'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6',
									errors.title
										? 'outline-red-500 focus:outline-red-500'
										: 'outline-gray-300 focus:outline-gray-500',
								)}
							/>
						</div>
					</div>

					<div className="mt-10 flex justify-end gap-2 border-t pb-5 pr-5">
						<Button variant="outlined" className="mt-5" onClick={closeModal}>
							Close
						</Button>
						<Button
							disabled={isDisabled}
							type="submit"
							className="mt-5"
							color="primary"
						>
							Edit
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	)
}
