using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Processing;
using Amazon.S3;
using Amazon.Runtime;
using SixLabors.ImageSharp.Formats.Jpeg;
using main.Models;
using Amazon.S3.Model;


public class IUploadToS3Input
{
    public required string AWSAccessKey { get; set; }
    public required string AWSSecretKey { get; set; }
    public required string BucketName { get; set; }
    public required Image Image { get; set; }
    public required string KeyName { get; set; }
}

public class ProcessImage
{
    public async static Task<Image?> AddTextWatermark(string inputImageUrl)
    {
        //create a image object containing the photograph to watermark
        using (var httpClient = new HttpClient())
        {
            var response = await httpClient.GetAsync(inputImageUrl);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Failed to download image: {response.StatusCode}");
                throw new Exception("FailedToDownloadImage");
            }

            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                Image image = Image.Load(stream);

                float[] alignments = [1.5f, 2.5f, 6.5f];

                image.Mutate(x => x.GaussianBlur(2)); // Adjust the blur radius as needed
                alignments.ToList().ForEach(align =>
                {
                    Font font = SystemFonts.CreateFont("Arial", 100, FontStyle.Bold);
                    RichTextOptions options = new(font)
                    {
                        Origin = new PointF(image.Width / align, image.Height / align), // Set the rendering origin.
                    };

                    image.Mutate(ctx => ctx
                        .DrawText(options, "Mfoni+", Brushes.Solid(Color.White))
                    );
                });

                return image;
            }

        }
    }

    public async static Task<S3MetaData> UploadToS3(IUploadToS3Input input)
    {
        var memoryStream = new MemoryStream();

        var encoder = new JpegEncoder
        {
            Quality = 50 // Reduce quality
        };

        input.Image.SaveAsJpeg(memoryStream, encoder);

        var credentials = new BasicAWSCredentials(input.AWSAccessKey, input.AWSSecretKey);
        var region = Amazon.RegionEndpoint.USEast1;
        var s3Client = new AmazonS3Client(credentials, region);

        var key = $"blurred_{input.KeyName}";

        using (memoryStream)
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = input.BucketName,
                Key = key,
                InputStream = memoryStream,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
            };

            PutObjectResponse response = await s3Client.PutObjectAsync(putRequest);

            return new S3MetaData
            {
                Bucket = input.BucketName,
                Key = key,
                Location = $"https://{input.BucketName}.s3.amazonaws.com/{key}",
                ServerSideEncryption = ServerSideEncryptionMethod.AES256,
                ETag = response.ETag
            };
        }
    }
}