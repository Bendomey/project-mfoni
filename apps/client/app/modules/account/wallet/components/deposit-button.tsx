import { useFetcher } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { DepositModal } from './deposit-modal.tsx'
import { Button } from '@/components/button/index.tsx'
import { ProcessingPaymentDialog } from '@/components/processing-payment-dialog.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast } from '@/lib/custom-toast-functions.tsx'

export function DepositButton() {
	const queryClient = useQueryClient()
	const depositModalState = useDisclosure()
	const processingPaymentModalState = useDisclosure()
	const fetcher = useFetcher<{
		error?: string
		accessCode?: string
	}>()

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher?.data?.error) {
			errorToast(fetcher?.data.error, {
				id: 'error-depositing-money',
			})
		}
	}, [fetcher?.data, fetcher.state])

	const handleSubmit = (amount: number) => {
		fetcher.submit(
			{
				amount,
			},
			{
				action: `/api/deposit-wallet`,
				encType: 'multipart/form-data',
				method: 'post',
				preventScrollReset: true,
			},
		)
	}

	const initiateOneTimePayment = useCallback(
		(accessCode: string) => {
			const popup = new window.PaystackPop()
			popup.resumeTransaction(accessCode, {
				onSuccess: () => {
					processingPaymentModalState.onOpen()
				},
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.accessCode) {
			depositModalState.onClose()
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS],
			})

			if (fetcher.data?.accessCode) {
				initiateOneTimePayment(fetcher.data.accessCode)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.data, fetcher.state, initiateOneTimePayment, queryClient])

	const isLoading = fetcher.state === 'submitting'
	return (
		<>
			<Button
				onClick={depositModalState.onOpen}
				variant="outlined"
				className="gap-1"
			>
				Deposit
			</Button>
			<DepositModal
				isSubmitting={isLoading}
				onSubmit={handleSubmit}
				isOpened={depositModalState.isOpened}
				onClose={depositModalState.onClose}
			/>
			<ProcessingPaymentDialog
				isOpened={processingPaymentModalState.isOpened}
				onClose={processingPaymentModalState.onClose}
			/>
		</>
	)
}
