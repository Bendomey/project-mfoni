import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { likeContent, unlikeContent } from '@/api/contents/index.ts'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'

const baseUrl = `${environmentVariables().API_ADDRESS}/api`

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const contentId = formData.get('contentId')
	const type = formData.get('type')

	if (!contentId || !type) {
		return { error: 'Invalid request' }
	}

	const authCookie = await extractAuthCookie(request.headers.get('cookie'))

	if (!authCookie) {
		const url = new URL(request.url)
		const returnTo = `${url.pathname}?from=${url.searchParams.get(
			'from',
		)}?content_id=${contentId}`
		return redirect(`/auth?return_to=${returnTo}`)
	}

	if (type === 'LIKE') {
		try {
			await likeContent(contentId as string, {
				authToken: authCookie.token,
				baseUrl,
			})
		} catch (error: unknown) {
			return { error: 'Liking image failed. Try again!' }
		}
	} else if (type === 'UNLIKE') {
		try {
			await unlikeContent(contentId as string, {
				authToken: authCookie.token,
				baseUrl,
			})
		} catch (error: unknown) {
			return { error: 'Removing like failed. Try again!' }
		}
	}

	return { success: true, action: type }
}

export async function loader({ request }: ActionFunctionArgs) {
	const authCookie = await extractAuthCookie(request.headers.get('cookie'))

	if (!authCookie) {
		return redirect('/auth')
	}

	const url = new URL(request.url)
	let from = url.searchParams.get('from')

	if (from) {
		if (from.includes('content_id=')) {
			const fromUrl = new URL(`${url.origin}${from}`)
			const contentId = fromUrl.searchParams.get('content_id')
			if (contentId) {
				try {
					await likeContent(contentId as string, {
						authToken: authCookie.token,
						baseUrl,
					})
					from = fromUrl.pathname
				} catch (error: unknown) {}
			}
		}

		return redirect(from)
	}

	return redirect('/')
}
