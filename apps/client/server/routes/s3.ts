import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as express from 'express'

const s3Router = express.Router()

const ACCESS_KEY = process.env.MFONI_AWS_ACCESS_KEY ?? ''
const SECRET_KEY = process.env.MFONI_AWS_SECRET_KEY ?? ''
const REGION = process.env.MFONI_AWS_REGION ?? ''
const BUCKET_NAME = process.env.S3_BUCKET ?? ''
const IMAGES_URL = process.env.MFONI_IMAGES_URL ?? ''

const s3Client = new S3Client({
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_KEY,
	},
	region: REGION,
})

s3Router.post(
	'/',
	async (
		req: express.Request<{}, {}, { filename: string; contentType: string }>,
		res,
	) => {
		const key = req.body.filename
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			ContentType: req.body.contentType,
		})
		const fileLink = `${IMAGES_URL}/${key}`
		const signedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: 5 * 60,
		})
		return res.json({ fileLink, signedUrl, key })
	},
)

// download the file
s3Router.post(
	'/download',
	async (req: express.Request<{}, {}, { key: string }>, res) => {
		const key = req.body.key
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
				key,
			)}"`,
		})
		const signedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: 5 * 60,
		})
		return res.json({ signedUrl })
	},
)

export { s3Router }
