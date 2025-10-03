
import { useFetcher } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { RemoveCardModal } from './modal.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast } from '@/lib/custom-toast-functions.tsx'

interface Props {
	savedCard: SavedCard
    children: (props: {
        onClick: VoidFunction
    }) => React.ReactNode
}

export function RemoveCardButton({
	savedCard,
    children
}: Props) {
	const queryClient = useQueryClient()
	const removeCardModalState = useDisclosure()
	const fetcher = useFetcher<{
		error?: string
		success?: boolean
	}>()

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher?.data?.error) {
			errorToast(fetcher?.data.error, {
				id: 'error-removing-card',
			})
		}
	}, [fetcher?.data, fetcher.state])

	const handleSubmit = () => {
		fetcher.submit(
			{
				savedCard: savedCard.id,
			},
			{
				action: `/api/remove-saved-card`,
				encType: 'multipart/form-data',
				method: 'post',
				preventScrollReset: true,
			},
		)
	}

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success) {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.SAVED_CARDS],
			})

		}
	}, [fetcher.data, fetcher.state, queryClient])

	const isLoading = fetcher.state === 'submitting'

    return (
        <>
            {children({ onClick: removeCardModalState.onOpen })}
            <RemoveCardModal
                savedCard={savedCard}
                isOpened={removeCardModalState.isOpened}
                onClose={removeCardModalState.onClose}
                onSubmit={handleSubmit}
                isSubmitting={isLoading}
            />
        </>
    );
}
