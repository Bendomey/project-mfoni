import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/index.ts'
import { getQueryParams } from '@/lib/get-param.ts'
import { fetchClient } from '@/lib/transport/index.ts'

export const getWalletTransactions = async (
	props: FetchMultipleDataInputParams<FetchWalletTransactionFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues =
			getQueryParams<FetchWalletTransactionFilter>(props)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<WalletTransaction>>
		>(`/v1/wallet-transactions?${params.toString()}`, {
			...(apiConfig ? apiConfig : {}),
		})

		return response.parsedBody.data
	} catch (error: unknown) {
		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}

		if (error instanceof Error) {
			throw error
		}
	}
}

export const useGetWalletTransactions = (
	query: FetchMultipleDataInputParams<FetchWalletTransactionFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS, query],
		queryFn: () => getWalletTransactions(query),
	})
