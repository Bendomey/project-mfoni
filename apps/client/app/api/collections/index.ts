import { useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/index.ts'
import { getQueryParams } from '@/lib/get-param.ts'
import { safeString } from '@/lib/strings.ts'
import { fetchClient } from '@/lib/transport/index.ts'

interface CreateCollection {
	name: string
	description: string
	visibility: 'PUBLIC' | 'PRIVATE'
}

export const createCollection = async (input: CreateCollection) => {
	try {
		const response = await fetchClient<ApiResponse<Collection>>(
			`/v1/collections`,
			{
				method: 'POST',
				body: JSON.stringify(input),
			},
		)

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}

		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		}

		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

export const useCreateCollection = () =>
	useMutation({
		mutationFn: createCollection,
	})

export const getCollections = async (
	query: FetchMultipleDataInputParams<FetchCollectionFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<FetchCollectionFilter>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<Collection>>
		>(`/v1/collections?${params.toString()}`, {
			...(apiConfig ? apiConfig : {}),
		})

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}

		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		}

		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

export const useGetCollections = (
	query: FetchMultipleDataInputParams<FetchCollectionFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.COLLECTIONS, query.filters?.created_by, query],
		queryFn: () => getCollections(query),
	})

export const getCollectionsContentCountByName = async (
	name: string,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchClient<ApiResponse<number>>(
			`/v1/collections/${name}/name/contents/count`,
			{
				...(apiConfig ? apiConfig : {}),
			},
		)

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}

		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		}

		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

export const useGetCollectionsContentCountByName = ({
	name,
}: {
	name?: string
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.CONTENTS, name, 'count'],
		queryFn: () => getCollectionsContentCountByName(safeString(name)),
		enabled: Boolean(name),
	})

export const getCollectionByName = async (
	name: string,
	query: FetchMultipleDataInputParams<FetchCollectionFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<FetchCollectionFilter>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<ApiResponse<Collection>>(
			`/v1/collections/${name}/name?${params.toString()}`,
			{
				...(apiConfig ? apiConfig : {}),
			},
		)

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}

		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		}

		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

export const useGetCollectionByName = ({
	name,
	query,
}: {
	name?: string
	query: FetchMultipleDataInputParams<FetchCollectionFilter>
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.COLLECTIONS, name, 'name'],
		queryFn: () => getCollectionByName(safeString(name), query),
		enabled: Boolean(name),
	})

export const getCollectionBySlug = async (
	slug: string,
	query: FetchMultipleDataInputParams<FetchCollectionFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<FetchCollectionFilter>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<ApiResponse<Collection>>(
			`/v1/collections/${slug}/slug?${params.toString()}`,
			{
				...(apiConfig ? apiConfig : {}),
			},
		)

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}

		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		}

		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

export const useGetCollectionBySlug = ({
	slug,
	query,
	retryQuery,
}: {
	slug?: string
	query: FetchMultipleDataInputParams<FetchCollectionFilter>
	retryQuery?: boolean
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.COLLECTIONS, slug, 'slug'],
		queryFn: () => getCollectionBySlug(safeString(slug), query),
		enabled: Boolean(slug),
		retry: retryQuery,
	})

export const getCollectionContentsBySlug = async (
	slug: string,
	query: FetchMultipleDataInputParams<FetchCollectionFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<FetchCollectionFilter>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<CollectionContent>>
		>(`/v1/collections/${slug}/slug/contents?${params.toString()}`, {
			...(apiConfig ? apiConfig : {}),
		})

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}

		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		}

		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

export const useGetCollectionContentsBySlug = ({
	slug,
	query,
	retryQuery,
}: {
	slug?: string
	query: FetchMultipleDataInputParams<FetchCollectionFilter>
	retryQuery?: boolean
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.COLLECTIONS, slug, 'slug-contents', query],
		queryFn: () => getCollectionContentsBySlug(safeString(slug), query),
		enabled: Boolean(slug),
		retry: retryQuery,
	})
