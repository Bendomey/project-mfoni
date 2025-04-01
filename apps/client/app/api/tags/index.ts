import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/index.ts'
import { getQueryParams } from '@/lib/get-param.ts'
import { fetchClient } from '@/lib/transport/index.ts'

export const getTags = async (
	props: FetchMultipleDataInputParams<FetchTagFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<FetchTagFilter>(props)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<Tag>>
		>(`/v1/tags?${params.toString()}`, {
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

export const useGetTags = (
	query: FetchMultipleDataInputParams<FetchTagFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.TAGS, query],
		queryFn: () => getTags(query),
	})

export const getTagBySlug = async (
	slug: string,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchClient<ApiResponse<Tag>>(
			`/v1/tags/${slug}/slug`,
			{
				...(apiConfig ? apiConfig : {}),
			},
		)

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

export const useGetTagBySlug = (slug: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.TAGS, slug],
		queryFn: () => getTagBySlug(slug),
	})

export const getTagContentsBySlug = async (
	slug: string,
	query: FetchMultipleDataInputParams<FetchTagContentFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<FetchTagContentFilter>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<TagContent>>
		>(`/v1/tags/${slug}/slug/contents?${params.toString()}`, {
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

export const useGetTagContentsBySlug = (
	slug: string,
	query: FetchMultipleDataInputParams<FetchTagContentFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.TAGS, slug, 'contents', query],
		queryFn: () => getTagContentsBySlug(slug, query),
	})
