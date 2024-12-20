import { useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/index.ts'
import { getQueryParams } from '@/lib/get-param.ts'
import { safeString } from '@/lib/strings.ts'
import { fetchClient } from '@/lib/transport/index.ts'

interface IGenerateSignedUrlInput {
	filename: string
	contentType: string
	abortController: AbortController
}

interface IGenerateSignedUrlOutput {
	fileLink: string
	signedUrl: string
}

export const generateSignedUrl = async (props: IGenerateSignedUrlInput) => {
	const res = await fetch('/api/s3', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			filename: props.filename,
			contentType: props.contentType,
		}),
		signal: props.abortController.signal,
	})
	const data = await res.json()
	return data as IGenerateSignedUrlOutput
}

export const useSignS3UploadUrl = () =>
	useMutation({
		mutationFn: generateSignedUrl,
	})

export type CreateContentInput = Array<{
	title: string
	content: {
		location: string
		eTag: string
		key: string
		serverSideEncryption: string
		bucket: string
		orientation: IContentOrientation
		size: number
	}
	tags?: string[]
	visibility: IContentVisibility
	amount?: number
}>

export const createContent = async (
	props: CreateContentInput,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchClient<ApiResponse<Array<Content>>>(
			`/v1/contents`,
			{
				method: 'POST',
				body: JSON.stringify(props),
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

export const likeContent = async (
	contentId: string,
	apiConfig: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchClient<ApiResponse<ContentLike>>(
			`/v1/contents/${contentId}/likes`,
			{
				method: 'POST',
				...apiConfig,
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

export const unlikeContent = async (
	contentId: string,
	apiConfig: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchClient<ApiResponse<boolean>>(
			`/v1/contents/${contentId}/likes`,
			{
				method: 'DELETE',
				...apiConfig,
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

export const getUserContentLikes = async (
	query: FetchMultipleDataInputParams<unknown>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<unknown>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<ContentLike>>
		>(`/v1/users/contents/likes?${params.toString()}`, {
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

export const useGetUserContentLikes = (
	query: FetchMultipleDataInputParams<unknown>,
	userId: string,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.CONTENT_LIKES, 'user', userId, query],
		queryFn: () => getUserContentLikes(query),
		enabled: !!userId,
	})

export const getContentLikes = async (
	query: FetchMultipleDataInputParams<unknown>,
	contentId: string,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<unknown>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<ContentLike>>
		>(`/v1/contents/${contentId}/likes?${params.toString()}`, {
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

export const useGetContentLikes = (
	query: FetchMultipleDataInputParams<unknown>,
	contentId: string,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.CONTENT_LIKES, contentId, query],
		queryFn: () => getContentLikes(query, contentId),
	})

export const getContentBySlug = async (
	slug: string,
	query: FetchMultipleDataInputParams<FetchContentFilter>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<FetchContentFilter>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<ApiResponse<Content>>(
			`/v1/contents/${slug}/slug?${params.toString()}`,
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

export const useGetContentBySlug = ({
	slug,
	query,
	retryQuery,
}: {
	slug?: string
	query: FetchMultipleDataInputParams<FetchContentFilter>
	retryQuery?: boolean
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.CONTENTS, slug, 'slug', query],
		queryFn: () => getContentBySlug(safeString(slug), query),
		enabled: Boolean(slug),
		retry: retryQuery,
	})

export const getRelatedContents = async (
	contentId: string,
	query: FetchMultipleDataInputParams<unknown>,
	apiConfig?: ApiConfigForServerConfig,
) => {
	try {
		const removeAllNullableValues = getQueryParams<unknown>(query)
		const params = new URLSearchParams(removeAllNullableValues)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<Content>>
		>(`/v1/contents/${contentId}/related?${params.toString()}`, {
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

export const useGetRelatedContents = ({
	contentId,
	query,
	retryQuery,
}: {
	contentId?: string
	query: FetchMultipleDataInputParams<unknown>
	retryQuery?: boolean
}) =>
	useQuery({
		queryKey: [QUERY_KEYS.CONTENTS, contentId, 'related', query],
		queryFn: () => getRelatedContents(safeString(contentId), query),
		enabled: Boolean(contentId),
		retry: retryQuery,
	})
