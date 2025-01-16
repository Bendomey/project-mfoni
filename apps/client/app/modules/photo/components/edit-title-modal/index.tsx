import { useState } from 'react'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'

interface Props {
	isOpened: boolean
	toggleModal: () => void
	title: string
}

export function EditTitleModal({ isOpened, toggleModal, title }: Props) {
	const [editTitle, setEditTitle] = useState(title)

	const handleInputChange = (e: any) => {
		setEditTitle(e.target.value)
	}

	return (
		<Modal
			onClose={toggleModal}
			isOpened={isOpened}
			className="relative w-full p-0 md:w-3/6 lg:w-2/6"
			canBeClosedWithBackdrop={false}
		>
			<div>
				<div>
					<div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
						<h1 className="font-bold">Edit Title</h1>
					</div>
					<div className="m-5">
						<div className="mt-2">
							<input
								id="title"
								name="title"
								type="text"
								value={editTitle}
								onChange={handleInputChange}
								placeholder="Title"
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
							/>
						</div>
					</div>

					<div className="mt-10 flex justify-end gap-2 border-t pb-5 pr-5">
						<Button className="mt-5" color="primary">
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
