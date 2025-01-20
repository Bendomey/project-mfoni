import { useFetcher } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'

interface Props {
	collection: Collection
}
export function StatusButton({ collection }: Props) {
	const fetcher = useFetcher<{ error: string; success: boolean }>()

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (fetcher?.data?.error) {
			errorToast(fetcher?.data.error, {
				id: 'error-collection-visibility-update',
			})
		}
	}, [fetcher?.data])

	if (collection.visibility === 'PRIVATE') {
		return <PublishButton collection={collection} />
	}

	return <HideButton collection={collection} />
}

function PublishButton({ collection }: Props) {
	const queryClient = useQueryClient()
	const fetcher = useFetcher<{ error: string; success: boolean }>()

	const publishModalState = useDisclosure()

	useEffect(() => {
		if (fetcher?.data?.success && fetcher.state === 'idle') {
			successToast('Collection published successfully', {
				id: 'success-collection-visibility-update',
			})
			publishModalState.onClose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher])

	const isSubmitting = fetcher.state !== 'idle'

	const handleSubmit = () => {
		fetcher.submit(
			{
				collectionId: collection.id,
				visibility: 'PUBLIC',
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
						<h1 className="text-2xl font-bold">Publish "{collection.name}"?</h1>
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

function HideButton({ collection }: Props) {
	const queryClient = useQueryClient()
	const fetcher = useFetcher<{ error: string; success: boolean }>()

	const hideModalState = useDisclosure()

	useEffect(() => {
		if (fetcher?.data?.success && fetcher.state === 'idle') {
			successToast('Collection hidden successfully', {
				id: 'success-collection-visibility-update',
			})
			hideModalState.onClose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher])

	const isSubmitting = fetcher.state !== 'idle'

	const handleSubmit = () => {
		fetcher.submit(
			{
				collectionId: collection.id,
				visibility: 'PRIVATE',
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
						<h1 className="text-2xl font-bold">Hide "{collection.name}"?</h1>
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
