import { BanknotesIcon } from '@heroicons/react/24/solid'
import { useFetcher } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { Button } from '@/components/button/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { ProcessingPaymentDialog } from '@/components/processing-payment-dialog.tsx'
import { QUERY_KEYS } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { errorToast } from '@/lib/custom-toast-functions.tsx'

interface Props {
	disabled?: boolean
	transactionId: string
	amount: number
}

export function ReinitiateDepositButton({
	disabled,
	transactionId,
	amount,
}: Props) {
	const queryClient = useQueryClient()
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

	const handleSubmit = () => {
		fetcher.submit(
			{
				amount,
				walletTransactionId: transactionId,
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
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS],
			})

			if (fetcher.data?.accessCode) {
				initiateOneTimePayment(fetcher.data.accessCode)
			}
		}
	}, [fetcher.data, fetcher.state, initiateOneTimePayment, queryClient])

	const isLoading = fetcher.state === 'submitting'
	return (
		<>
			<Button
				onClick={handleSubmit}
				disabled={disabled || isLoading}
				variant="outlined"
				title="Pay Wallet"
				className=""
			>
				{isLoading ? (
					<Loader size="5" />
				) : (
					<>
						<BanknotesIcon className="mr-1 h-4 w-auto text-gray-600" />
						Pay
					</>
				)}
			</Button>
			<ProcessingPaymentDialog
				isOpened={processingPaymentModalState.isOpened}
				onClose={processingPaymentModalState.onClose}
			/>
		</>
	)
}
