const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const region = process.env.MFONI_AWS_REGION

// Create an S3 instance
const s3Client = new S3Client({
	credentials: {
		accessKeyId: process.env.MFONI_AWS_ACCESS_KEY,
		secretAccessKey: process.env.MFONI_AWS_SECRET_KEY,
	},
	region,
})

// Define the bucket name and file path
const bucketName = process.env.S3_BUCKET
const filePath = '../../../assets/mfoni.jpg'
const fileKey = 'project-mfoni-example.jpg'

// Read the file from the local system
const fileContent = fs.readFileSync(filePath)

const main = async () => {
	const params = {
		Bucket: bucketName,
		Key: fileKey,
		Body: fileContent,
	}

	const command = new PutObjectCommand(params)

	try {
		const response = await s3Client.send(command)
		// persist the response.
		console.log('File uploaded successfully:', {
			ETag: response.ETag,
			Location: `https://${bucketName}.s3.amazonaws.com/${fileKey}`,
			Key: fileKey,
			ServerSideEncryption: response.ServerSideEncryption,
			Bucket: 'staging-mfoni',
		})
	} catch (err) {
		console.error(err)
	}
}

main()
