// eslint-disable-next-line import/no-extraneous-dependencies
const { RekognitionClient, DetectFacesCommand } = require("@aws-sdk/client-rekognition");

const region = process.env.AWS_REGION;

// Create rekognition instance
const rekognitionClient = new RekognitionClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey:  process.env.AWS_SECRET_KEY,
    },
    region,
})
const bucketName = process.env.S3_BUCKET;
const fileKey = 'IMG_4211 - 1.jpg'

const main = async () => {
    const command = new DetectFacesCommand({
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: fileKey
            }
        },
        Attributes: ['ALL']
    });

    try {
        const response = await rekognitionClient.send(command);
        console.log('Face detection ran successfully:', JSON.stringify(response));
        if(response.FaceDetails.length > 0){
            console.log("Face detected")
        } else  {
            // don't index image if no face detected.
            console.log("No face detected")
        }

    } catch (err) {
        console.error(err);
    }
}

main()
