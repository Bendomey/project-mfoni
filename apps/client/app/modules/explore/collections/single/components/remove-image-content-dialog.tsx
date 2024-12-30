import { useQueryClient } from '@tanstack/react-query'
import { useRemoveContentsToCollection } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { errorToast } from '@/lib/custom-toast-functions.tsx'
import { safeString } from '@/lib/strings.ts'

interface Props {
	isOpened: boolean
	onClose: () => void
	collectionSlug: string
	collectionContent?: CollectionContent
}

export function RemoveImageContentModal({
	collectionContent,
	collectionSlug,
	isOpened,
	onClose,
}: Props) {
	const queryClient = useQueryClient()
	const { isPending: isSubmitting, mutate } = useRemoveContentsToCollection()

	const handleSubmit = () => {
		if (!collectionContent) return
		mutate(
			{
				collectionId: collectionContent?.collectionId,
				contentIds: [safeString(collectionContent?.contentId)],
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: [QUERY_KEYS.COLLECTIONS, collectionSlug, 'slug-contents'],
					})
					onClose()
				},
				onError: () => {
					errorToast('Removing content failed. Please try again.')
				},
			},
		)
	}
	return (
		<Modal
			className="w-full md:w-4/6 lg:w-2/6"
			isOpened={isOpened}
			onClose={onClose}
		>
			<div>
				<div className="mt-2 grid grid-cols-1">
					<h1 className="text-2xl font-bold">
						Remove "{collectionContent?.content?.title}"?
					</h1>
					<p className="mt-2 text-sm">Image can be added again later.</p>
				</div>
				<div className="mt-4 flex justify-end gap-2">
					<Button variant="solid" color="secondaryGhost" onClick={onClose}>
						Cancel
					</Button>

					<Button variant="solid" color="danger" onClick={handleSubmit}>
						{isSubmitting ? 'Removing...' : 'Remove'}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
