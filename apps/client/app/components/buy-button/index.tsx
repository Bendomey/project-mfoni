import { useFetcher, useSearchParams } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { BuyModal } from './buy-modal/index.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast, successToast } from '@/lib/custom-toast-functions.tsx'

export type ContentSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ORIGINAL'

declare global {
	interface Window {
		// @TODO: type it later.
		PaystackPop: any
	}
}

interface Props {
	content: Content
	children: (props: { onClick: () => void }) => React.ReactNode
}

export function BuyButtonApi({ children, content }: Props) {
	const fetcher = useFetcher<{
		error?: string
		paymentMethod?: string
		accessCode?: string
	}>()
	const queryClient = useQueryClient()
	const [searchParams] = useSearchParams()
	const buyModalState = useDisclosure()

	useEffect(() => {
		const buyParam = searchParams.get('buy')
		const isBuyModalOpened = Boolean(buyParam && buyParam !== 'false')

		if (isBuyModalOpened) {
			buyModalState.onOpen()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher?.data?.error) {
			errorToast(fetcher?.data.error, {
				id: 'error-buying-content',
			})
		}
	}, [fetcher?.data, fetcher.state])

	const initiateOneTimePayment = useCallback((accessCode: string) => {
		const popup = new window.PaystackPop()
		popup.resumeTransaction(accessCode)
	}, [])

	useEffect(() => {
		if (
			fetcher.state === 'idle' &&
			fetcher.data?.paymentMethod &&
			fetcher.data?.accessCode
		) {
			buyModalState.onClose()
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONTENTS, content.slug],
			})

			if (
				fetcher.data?.paymentMethod === 'ONE_TIME' &&
				fetcher.data?.accessCode
			) {
				initiateOneTimePayment(fetcher.data.accessCode)
			} else if (fetcher.data?.paymentMethod === 'WALLET') {
				successToast('Content purchased successfully', {
					id: 'success-purchased-content',
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content.slug, fetcher.data, fetcher.state, initiateOneTimePayment])

	const handleSubmit = (paymentMethod: string) => {
		fetcher.submit(
			{
				contentId: content.id,
				paymentMethod: paymentMethod,
			},
			{
				action: `/api/buy-content`,
				encType: 'multipart/form-data',
				method: 'post',
				preventScrollReset: true,
			},
		)
	}

	const isLoading = fetcher.state === 'submitting'

	return (
		<>
			{children({ onClick: buyModalState.onOpen })}
			<BuyModal
				closeModal={buyModalState.onClose}
				isOpened={buyModalState.isOpened}
				content={content as unknown as Content}
				onSubmit={handleSubmit}
				isLoading={isLoading}
			/>
		</>
	)
}
