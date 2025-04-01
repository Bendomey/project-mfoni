import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/index.ts'
import { getQueryParams } from '@/lib/get-param.ts'
import { fetchClient } from '@/lib/transport/index.ts'

export const getExploreSections = async (
	props: FetchMultipleDataInputParams<FetchExploreSectionFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues =
			getQueryParams<FetchExploreSectionFilter>(props)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<ExploreSection>>
		>(`/v1/explore?${params.toString()}`, {
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

export const useGetExploreSections = (
	query: FetchMultipleDataInputParams<FetchExploreSectionFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.EXPLORE],
		queryFn: () => getExploreSections(query),
	})
