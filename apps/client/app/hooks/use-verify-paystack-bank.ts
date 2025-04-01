import { useFetcher } from '@remix-run/react'
import { useCallback } from 'react'

export function useVerifyPaystackBank() {
	const fetcher = useFetcher<{
		accountDetails?: PaystackBankVerify
		error?: string
	}>()

	const mutate = useCallback(
		async ({
			accountNumber,
			bankCode,
		}: {
			accountNumber: string
			bankCode: string
		}) => {
			fetcher.submit(
				{
					accountNumber,
					bankCode,
				},
				{
					method: 'post',
					action: '/api/paystack/banks',
					encType: 'multipart/form-data',
				},
			)
		},
		[fetcher],
	)

	const isSubmitting = fetcher.state === 'submitting'

	return {
		isLoading: isSubmitting,
		data: fetcher.data?.accountDetails,
		error: fetcher.data?.error,
		isError: fetcher.data?.error && fetcher.state === 'idle',
		mutate,
	}
}
