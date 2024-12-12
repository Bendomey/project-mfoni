 
const {
	RekognitionClient,
	IndexFacesCommand,
} = require('@aws-sdk/client-rekognition')

const region = process.env.MFONI_AWS_REGION

const collection = process.env.REKOGNITION_COLLECTION

// Create rekognition instance
const rekognitionClient = new RekognitionClient({
	credentials: {
		accessKeyId: process.env.MFONI_AWS_ACCESS_KEY,
		secretAccessKey: process.env.MFONI_AWS_SECRET_KEY,
	},
	region,
})
const bucketName = process.env.S3_BUCKET
const fileKey = 'IMG_4211 - 1.jpg'

const main = async () => {
	const command = new IndexFacesCommand({
		Image: {
			S3Object: {
				Bucket: bucketName,
				Name: fileKey,
			},
		},
		CollectionId: collection,
		// require this. This will help retrieve content on search faster because our ids are indexed.
		// ExternalImageId: "our-own-id-here"
	})

	try {
		const response = await rekognitionClient.send(command)
		console.log('Face indexing ran successfully:', JSON.stringify(response))
	} catch (err) {
		console.error(err)
	}
}

main()
