import { yupResolver } from '@hookform/resolvers/yup'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { useEditContent } from '@/api/photos/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'

interface Props {
	isOpened: boolean,
	toggleModal: () => void,
	title: string,
	contentId: string,
	amount: number
}

interface Inputs {
	title: string,
}

const schema = Yup.object().shape({
	title: Yup.string()
		.required('Title is required.')
})

export function EditTitleModal({ isOpened, toggleModal, title, contentId }: Props) {
	const { mutate, isPending } = useEditContent();
	const queryClient = useQueryClient()
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch
	} = useForm<Inputs>({
		resolver: yupResolver(schema),
	})

	useEffect(() => {
		if (title) {
			setValue('title', title)
		}
	}, [title, setValue])

	const onSubmit: SubmitHandler<Inputs> = (data) => {
		mutate(
			{
				props: {
					title: data.title,
				},
				contentId: contentId
			},
			{
				onError: () => {
					errorToast('Update failed. Try again')
				},
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: [QUERY_KEYS.CONTENTS]
					})
					successToast('Title edited successfully')
					toggleModal()
				}
			}
		)
	}

	const isDisabled = watch('title') === title || isPending || !!errors.title

	return (
		<Modal
			onClose={toggleModal}
			isOpened={isOpened}
			className="relative w-full p-0 md:w-3/6 lg:w-2/6"
			canBeClosedWithBackdrop={false}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div >
					<div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
						<h1 className="font-bold">Edit Title</h1>
					</div>
					<div className="m-5">
						<div className="mt-2">
							<input
								id="title"
								type="text"
								{...register('title')}
								placeholder="Title"
								className={
									classNames(
										"block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6",
										errors.title ? 'outline-red-500 focus:outline-red-500' : 'outline-gray-300 focus:outline-gray-500',

									)
								}
							/>
						</div>
					</div>

					<div className="mt-10 flex justify-end gap-2 border-t pb-5 pr-5">
						<Button
							disabled={isDisabled}
							type='submit'
							className="mt-5"
							color="primary"
						>
							Edit
						</Button>
						<Button variant="outlined" className="mt-5" onClick={toggleModal}>
							Close
						</Button>
					</div>
				</div>
			</form>
		</Modal>

	)
}
