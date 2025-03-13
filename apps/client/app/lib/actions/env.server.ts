import * as z from 'zod'

const environmentSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test', 'staging'])
		.default('development'),
	API_ADDRESS: z.string().min(1),
	MFONI_AWS_SECRET_KEY: z.string().min(1),
	MFONI_AWS_ACCESS_KEY: z.string().min(1),
	MFONI_AWS_REGION: z.string().min(1),
	S3_BUCKET: z.string().min(1),
	REKOGNITION_COLLECTION: z.string().min(1),
	MFONI_GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
	TWITTER_CONSUMER_KEY: z.string().min(1),
	TWITTER_CONSUMER_SECRET: z.string().min(1),
	FACEBOOK_APP_ID: z.string().min(1),
	FACEBOOK_APP_SECRET: z.string().min(1),
	METRIC_CLIENT_ID: z.string().min(1),
	METRIC_CLIENT_SECRET: z.string().min(1),
	SENTRY_DSN: z.string().min(1).optional(),
	TAWK_ID: z.string().min(1),
	REMIX_SERVER_JWT_SECRET: z.string().min(1),
	REMIX_SERVER_JWT_ISSUER: z.string().min(1),
	REMIX_JWT: z.string().min(1),
	
})

const environmentVariables = () => environmentSchema.parse(process.env)

export { environmentVariables }
