import { useFetcher } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
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
	count: number
	collectionVisibility: string
}

export function RemoveImageContentModal({
	collectionContent,
	isOpened,
	onClose,
	count,
	collectionVisibility,
}: Props) {
	const queryClient = useQueryClient()
	const { isPending, mutate } = useRemoveContentsToCollection()
	const fetcher = useFetcher<{ error: string; success: boolean }>()

	useEffect(() => {
		if (fetcher?.data?.success && fetcher.state === 'idle') {
			onClose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher])

	const handleSubmit = () => {
		if (!collectionContent) return
		mutate(
			{
				collectionId: collectionContent?.collectionId,
				contentIds: [safeString(collectionContent?.contentId)],
				type: 'CONTENT',
			},
			{
				onSuccess: () => {
					if (count === 1 && collectionVisibility === 'PUBLIC') {
						// hide collection since it has no more content
						fetcher.submit(
							{
								collectionId: collectionContent.collectionId,
								visibility: 'PRIVATE',
							},
							{
								action: `/api/update-collection`,
								encType: 'multipart/form-data',
								method: 'patch',
								preventScrollReset: true,
							},
						)
					} else {
						onClose()
					}

					queryClient.invalidateQueries({
						queryKey: [QUERY_KEYS.COLLECTIONS],
					})
				},
				onError: () => {
					errorToast('Removing content failed. Please try again.')
				},
			},
		)
	}

	const isHidingCollection = fetcher.state !== 'idle'
	const isSubmitting = isHidingCollection || isPending

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

					<Button
						disabled={isSubmitting}
						variant="solid"
						color="danger"
						onClick={handleSubmit}
					>
						{isPending
							? 'Removing...'
							: isHidingCollection
								? 'Hiding Collection ...'
								: 'Remove'}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
