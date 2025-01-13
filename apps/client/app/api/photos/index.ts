import { useMutation } from '@tanstack/react-query'
import { fetchClient } from '@/lib/transport/index.ts'

export type EditInput = {
	title?: string
	visibility?: string
	amount?: number
}

export const EditContent = async ({
	props,
	contentId,
}: {
	props: EditInput
	contentId: string
}) => {
	try {
		const response = await fetchClient(`/v1/contents/${contentId}`, {
			method: 'PATCH',
			body: JSON.stringify(props),
		})

		return response
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		}

		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

export const useEditContent = () =>
	useMutation({
		mutationFn: EditContent,
	})
