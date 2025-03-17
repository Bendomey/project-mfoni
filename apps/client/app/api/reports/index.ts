import { useMutation } from '@tanstack/react-query'
import { fetchClient } from '@/lib/transport/index.ts'

interface createContentReportCase {
	name?: string
	phone?: string
	email?: string
	contentType: 'TAG' | 'IMAGE' | 'COLLECTION'
	contentSlug: string
	reasonForReport: string
	breakingLocalLaws: string
	additionalDetails?: string
}

export const createContentReportCase = async (
	input: createContentReportCase,
) => {
	try {
		const response = await fetchClient<ApiResponse<ContentReportCase>>(
			`/v1/report-content-cases`,
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

export const useCreateContentReportCase = () =>
	useMutation({
		mutationFn: createContentReportCase,
	})
