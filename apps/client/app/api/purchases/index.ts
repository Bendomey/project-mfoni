import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/index.ts'
import { getQueryParams } from '@/lib/get-param.ts'
import { fetchClient } from '@/lib/transport/index.ts'

export const getContentPurchases = async (
	props: FetchMultipleDataInputParams<FetchContentPurchaseFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues =
			getQueryParams<FetchContentPurchaseFilter>(props)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<ContentPurchase>>
		>(`/v1/users/${props.filters?.userId}/purchases?${params.toString()}`, {
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

export const useGetContentPurchases = (
	query: FetchMultipleDataInputParams<FetchContentPurchaseFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.CONTENT_PURCHASES, query],
		queryFn: () => getContentPurchases(query),
	})
