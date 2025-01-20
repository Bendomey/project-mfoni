import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { updateCollection } from '@/api/collections/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'

const baseUrl = `${environmentVariables().API_ADDRESS}/api`

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const collectionId = formData.get('collectionId')
	const name = formData.get('name')
	const visibility = formData.get('visibility')
	const description = formData.get('description')

	if (!collectionId) {
		return { error: 'Invalid request' }
	}

	const authCookie = await extractAuthCookie(request.headers.get('cookie'))

	if (!authCookie) {
		const url = new URL(request.url)
		const returnTo = `${url.pathname}?${url.searchParams.toString()}`
		return redirect(`/auth?return_to=${returnTo}`)
	}

	try {
		await updateCollection(
			collectionId as string,
			{
				description: description ? String(description) : undefined,
				name: name ? String(name) : undefined,
				visibility: visibility ? String(visibility) : undefined,
			},
			{
				authToken: authCookie.token,
				baseUrl,
			},
		)
	} catch (error: unknown) {
		return { error: 'Update failed. Try again!' }
	}

	return { success: true }
}
