// eslint-disable-next-line import/no-extraneous-dependencies
const { RekognitionClient, SearchFacesByImageCommand } = require("@aws-sdk/client-rekognition");
const fs = require('fs');

const region = process.env.AWS_REGION;

const collection = process.env.REKOGNITION_COLLECTION;

// Create rekognition instance
const rekognitionClient = new RekognitionClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey:  process.env.AWS_SECRET_KEY,
    },
    region,
})

// eslint-disable-next-line no-unused-vars
const bucketName = process.env.S3_BUCKET;
const filePath = 'domey.jpeg';
const fileContent = fs.readFileSync(filePath);

const main = async () => {
    const command = new SearchFacesByImageCommand({
        Image: {
            // use either S3Object or Bytes, not both.
            // S3Object: {
            //     Bucket: bucketName,
            //     Name: fileKey
            // }
            Bytes: fileContent
        },
        CollectionId: collection,
    });

    try {
        const response = await rekognitionClient.send(command);
        console.log('Face search ran successfully:', JSON.stringify(response));
    } catch (err) {
        console.error(err);
    }
}

main()
