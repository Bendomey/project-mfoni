import { useEditCollectionTitle } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface Props {
	isOpened: boolean,
	toggleModal: () => void,
	title: string | undefined,
	collectionId: string
}

interface Inputs {
	name: string,
	discription?: string,
	visibility?: string
}

export function EditCollectionTitleModal({ isOpened, toggleModal, title, collectionId }: Props) {
	const [editCollectionTitle, setEditCollectionTitle] = useState(title)
	const { mutate } = useEditCollectionTitle();
	const queryClient = useQueryClient()
	const { handleSubmit } = useForm<Inputs>()

	const handleInputChange = (e: any) => {
		setEditCollectionTitle(e.target.value);
	}

	const onSubmit: SubmitHandler<Inputs> = (data) => {
		mutate(
			{
				props: {
					name: data.name,
					visibility: 'PUBLIC',
					discription: data.discription
				},
				id: collectionId
			},
			{
				onError: () => {
					errorToast('Title could not edit. Try again')
				},
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: [QUERY_KEYS.COLLECTIONS]
					})
					successToast('Title edited successfully')
				}
			}
		)
	}

	return (
		<Modal
			onClose={toggleModal}
			isOpened={isOpened}
			className="relative w-full p-0 md:w-3/6 lg:w-2/6"
			canBeClosedWithBackdrop={false}
		>
			<div >
				<div >
					<div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
						<h1 className="font-bold">Edit Collection Title</h1>
					</div>
					<div className="m-5">
						<div className="mt-2">
							<input
								id="title"
								name="title"
								type="text"
								value={editCollectionTitle}
								onChange={handleInputChange}
								placeholder="Title"
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
							/>
						</div>
					</div>

					<div className="mt-10 flex justify-end gap-2 border-t pb-5 pr-5">
						<Button
							className="mt-5"
							color="primary"
							onClick={handleSubmit(onSubmit)}
						>
							Edit
						</Button>
						<Button variant="outlined" className="mt-5" onClick={toggleModal}>
							Close
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	)
}
