import { useFetcher } from '@remix-run/react'
import { useCallback, useEffect } from 'react'

export function useGetPaystackBanks() {
	const fetcher = useFetcher<{
		banks?: PaystackBank[]
		error?: string
	}>()

	const fetchBanks = useCallback(async () => {
		fetcher.load('/api/paystack/banks')
	}, [fetcher])

	useEffect(() => {
		fetchBanks()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const isFetchingBanks = fetcher.state === 'loading' && fetcher.formMethod == null && !fetcher.data?.banks

	return {
		isLoading: isFetchingBanks,
		data: fetcher.data?.banks,
		error: fetcher.data?.error,
        isError : fetcher.data?.error && fetcher.state === 'idle',
		fetch: fetchBanks,
	}
}
