import { type ActionFunctionArgs } from '@remix-run/node'
import { downloadContent } from '@/api/contents/index.ts'
import { generateDownloadSignedUrl } from '@/api/image/index.ts'
import { type ContentSize } from '@/components/download-button.tsx'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { getDomainUrl } from '@/lib/misc.ts'

export async function action({ request }: ActionFunctionArgs) {
	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	const formData = await request.formData()
	const contentId = formData.get('contentId')
	const size = formData.get('size')

	if (!contentId || !size) {
		return { error: 'Invalid request' }
	}

	const authCookie = await extractAuthCookie(request.headers.get('cookie'))

	try {
		const response = await downloadContent(
			{
				contentId: contentId as string,
				size: size as ContentSize,
			},
			{
				authToken: authCookie ? authCookie.token : undefined,
				baseUrl,
			},
		)

		if (response) {
			const downloadSignedUrl = await generateDownloadSignedUrl(
				{
					key: response?.key,
				},
				getDomainUrl(request),
			)

			return { success: true, signedUrl: downloadSignedUrl.signedUrl, size }
		}
	} catch {
		return { error: 'Downloading image failed. Try again!' }
	}
}
