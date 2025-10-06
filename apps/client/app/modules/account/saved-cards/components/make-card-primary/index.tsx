
import { useFetcher } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { MakeCardPrimaryModal } from './modal.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast } from '@/lib/custom-toast-functions.tsx'

interface Props {
	savedCard: SavedCard
    children: (props: {
        onClick: VoidFunction
    }) => React.ReactNode
}

export function MakeCardPrimaryButton({
	savedCard,
    children
}: Props) {
	const queryClient = useQueryClient()
	const makeCardPrimaryModalState = useDisclosure()
	const fetcher = useFetcher<{
		error?: string
		success?: boolean
	}>()

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher?.data?.error) {
			errorToast(fetcher?.data.error, {
				id: 'error-making-card-primary',
			})
		}
	}, [fetcher?.data, fetcher.state])

	const handleSubmit = () => {
		fetcher.submit(
			{
				savedCardId: savedCard.id,
			},
			{
				action: `/api/make-saved-card-primary`,
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
            {children({ onClick: makeCardPrimaryModalState.onOpen })}
            <MakeCardPrimaryModal
                savedCard={savedCard}
                isOpened={makeCardPrimaryModalState.isOpened}
                onClose={makeCardPrimaryModalState.onClose}
                onSubmit={handleSubmit}
                isSubmitting={isLoading}
            />
        </>
    );
}
