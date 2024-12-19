import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'

interface Props {
	isOpened: boolean,
	toggleModal: () => void
}

export function EditTitleModal( {isOpened, toggleModal }: Props) {
const onClose = ()=>{
	isOpened = false
}

	return (
		<Modal
		onClose={onClose}
				isOpened={isOpened}
				className="relative w-full p-0 md:w-4/6 lg:w-3/6"
				canBeClosedWithBackdrop={false}
			>
				<div className="m-5">
					<div >
					<div>
						<label htmlFor="title" className="block text-sm/6 font-medium text-gray-900">
							Title
						</label>
						<div className="mt-2">
							<input
							id="title"
							name="title"
							type="text"
							placeholder="Title"
							className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
							/>
						</div>
						</div>
						
						
						<div className="flex flex-row items-center gap-2">
							<Button
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
				</div>
			</Modal>
	)
}
