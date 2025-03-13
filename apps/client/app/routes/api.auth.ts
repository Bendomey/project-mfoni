import { type ActionFunctionArgs } from '@remix-run/node'
import { authenticate, type AuthenticateInputProps } from '@/api/auth/index.ts'
import { errorMessagesWrapper } from '@/constants/error-messages.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'

export async function action({ request }: ActionFunctionArgs) {
	const env = environmentVariables()
	const remixJwt = env.REMIX_JWT

	const formData = await request.formData()
	const provider = formData.get('provider')
	const google = formData.get('google')
	const facebook = formData.get('facebook')
	const twitter = formData.get('twitter')

	if (!provider || (!google && !facebook && !twitter)) {
		return { error: 'Invalid request' }
	}

	try {
		const response = await authenticate(
			{
				provider: provider as AuthenticateInputProps['provider'],
				google: google
					? (google as unknown as AuthenticateInputProps['google'])
					: undefined,
				facebook: facebook
					? (facebook as unknown as AuthenticateInputProps['facebook'])
					: undefined,
				twitter: twitter
					? (twitter as unknown as AuthenticateInputProps['twitter'])
					: undefined,
			},
			remixJwt,
		)

		if (response) {
			return {
				success: true,
				data: response,
			}
		}
	} catch (error) {
		let errorMessage = 'Failed to login. Try again!'

		if (error instanceof Error) {
			errorMessage = errorMessagesWrapper(error.message)
		}

		return { error: errorMessage }
	}
}
