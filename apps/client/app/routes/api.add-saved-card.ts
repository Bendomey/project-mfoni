import { type ActionFunctionArgs } from '@remix-run/node'
import { initiateSavedCardCreationInput } from '@/api/saved-cards/index.ts'
import { errorMessagesWrapper } from '@/constants/error-messages.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'

export async function action({ request }: ActionFunctionArgs) {
	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	const formData = await request.formData()
	const billingEmail = formData.get('billingEmail')

	if (!billingEmail) {
		return { error: 'Invalid request' }
	}

	const authCookie = await extractAuthCookie(request.headers.get('cookie'))

	try {
		const response = await initiateSavedCardCreationInput(
			{
				billingEmail: String(billingEmail),
			},
			{
				authToken: authCookie ? authCookie.token : undefined,
				baseUrl,
			},
		)

		if (response) {
			return {
				success: true,
				accessCode: response.accessCode,
			}
		}
	} catch (error) {
		let errorMessage = 'Add card initiation failed. Try again!'

		if (error instanceof Error) {
			const newErrorResponse = errorMessagesWrapper(error.message)
			if (
				newErrorResponse !== 'Something went wrong. Please try again later.'
			) {
				errorMessage = newErrorResponse
			}
		}

		return { error: errorMessage }
	}
}
