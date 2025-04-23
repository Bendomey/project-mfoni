import { type Readable } from 'stream'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { type ActionFunctionArgs } from '@remix-run/node'
import JSZip from 'jszip'
import { downloadContent } from '@/api/contents/index.ts'
import { type ContentSize } from '@/components/download-button.tsx'
import { environmentVariables } from '@/lib/actions/env.server.ts'
import { extractAuthCookie } from '@/lib/actions/extract-auth-cookie.ts'
import { generateLicensePdf } from '@/lib/actions/license-pdf-generator.server.ts'
import { readmeTxtGenerator } from '@/lib/actions/readme.txt-generator.server.ts'
import { streamToBuffer } from '@/lib/stream-to-buffer.ts'
import { safeString } from '@/lib/strings.ts'

export async function action({ request }: ActionFunctionArgs) {
	const ACCESS_KEY = process.env.MFONI_AWS_ACCESS_KEY ?? ''
	const SECRET_KEY = process.env.MFONI_AWS_SECRET_KEY ?? ''
	const REGION = process.env.MFONI_AWS_REGION ?? ''
	const downloadDate = safeString(new Date().toISOString().split('T')[0])

	const s3Client = new S3Client({
		credentials: {
			accessKeyId: ACCESS_KEY,
			secretAccessKey: SECRET_KEY,
		},
		region: REGION,
	})
	const baseUrl = `${environmentVariables().API_ADDRESS}/api`

	const formData = await request.formData()
	const contentId = formData.get('contentId')
	const size = formData.get('size')
	const customerName = formData.get('customerName')
	const contentTitle = formData.get('contentTitle')

	if (!contentId || !size || !customerName || !contentTitle) {
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
			// download image from S3
			const getObjCmd = new GetObjectCommand({
				Bucket: response?.bucket,
				Key: response?.key,
			})

			const s3Result = await s3Client.send(getObjCmd)
			const s3ImageStream = s3Result.Body
			const imageBuffer = await streamToBuffer(s3ImageStream as Readable)

			// generate license PDF
			const pdfBuffer = await generateLicensePdf({
				customerName: customerName.toString(),
				imageTitle: contentTitle.toString(),
				downloadDate,
			})

			// generate readme.txt
			const readmeTxt = readmeTxtGenerator({
				imageTitle: contentTitle.toString(),
				downloadDate,
			})

			// Set up ZIP
			const zip = new JSZip()

			// Add files
			zip.file(`contents/${response.key}`, new Uint8Array(imageBuffer))
			zip.file('license.pdf', pdfBuffer)
			zip.file('readme.txt', readmeTxt)

			const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

			const title = `${contentTitle.toString().replace(/ /g, '-')}-mfoni`.toLowerCase()

			return new Response(zipBuffer, {
				headers: {
					'Content-Type': 'application/zip',
					'Content-Disposition': `attachment; filename=${encodeURIComponent(`${title}.zip`)}`,
				},
			})
		}
	} catch (e) {
		console.error('Error downloading content:', e)
		return { error: 'Downloading image failed. Try again!' }
	}
}
