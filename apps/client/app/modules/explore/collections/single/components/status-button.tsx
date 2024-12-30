import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'

interface Props {
	collection: Collection
}
export function StatusButton({ collection }: Props) {
	if (collection.visibility === 'PRIVATE') {
		return <PublishButton />
	}

	return <HideButton />
}

function PublishButton() {
	const publishModalState = useDisclosure()

	const isSubmitting = false

	const handleSubmit = () => {}

	return (
		<>
			<Button onClick={publishModalState.onToggle}>Publish</Button>
			<Modal
				className="w-full md:w-4/6 lg:w-2/6"
				isOpened={publishModalState.isOpened}
				onClose={publishModalState.onClose}
			>
				<div>
					<div className="mt-2 grid grid-cols-1">
						<h1 className="text-2xl font-bold">Publish "Name of Content"?</h1>
						<p className="mt-2 text-sm">
							This will make the collection public. You can always hide it.
						</p>
					</div>
					<div className="mt-4 flex justify-end gap-2">
						<Button
							variant="solid"
							color="secondaryGhost"
							onClick={publishModalState.onClose}
						>
							Cancel
						</Button>

						<Button variant="solid" onClick={handleSubmit}>
							{isSubmitting ? 'Publishing...' : 'Publish'}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}

function HideButton() {
	const hideModalState = useDisclosure()

	const isSubmitting = false

	const handleSubmit = () => {}

	return (
		<>
			<Button color="secondaryGhost" onClick={hideModalState.onToggle}>
				Hide
			</Button>
			<Modal
				className="w-full md:w-4/6 lg:w-2/6"
				isOpened={hideModalState.isOpened}
				onClose={hideModalState.onClose}
			>
				<div>
					<div className="mt-2 grid grid-cols-1">
						<h1 className="text-2xl font-bold">Hide "Name of Content"?</h1>
						<p className="mt-2 text-sm">
							This will hide the collection from users. You can always publish
							it.
						</p>
					</div>
					<div className="mt-4 flex justify-end gap-2">
						<Button
							variant="solid"
							color="secondaryGhost"
							onClick={hideModalState.onClose}
						>
							Cancel
						</Button>

						<Button variant="solid" onClick={handleSubmit}>
							{isSubmitting ? 'Hiding...' : 'Hide'}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}
