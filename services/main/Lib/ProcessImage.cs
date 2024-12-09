using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Processing;
using Amazon.S3;
using Amazon.Runtime;
using SixLabors.ImageSharp.Formats.Jpeg;
using main.Models;
using Amazon.S3.Model;

namespace main.Lib;

public class IUploadToS3Input
{
    public required string AWSAccessKey { get; set; }
    public required string AWSSecretKey { get; set; }
    public required string BucketName { get; set; }
    public required Image Image { get; set; }
    public required string KeyName { get; set; }
    public required string Orientation { get; set; }
    public int ImageQuality { get; set; } = 85;
}

public class ProcessImage
{

    // download the image
    public async static Task<Image> DownloadImage(string imageUrl)
    {
        using (var httpClient = new HttpClient())
        {
            var response = await httpClient.GetAsync(imageUrl);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Failed to download image: {response.StatusCode}");
                throw new Exception("FailedToDownloadImage");
            }

            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                return Image.Load(stream);
            }
        }
    }

    public static Image AddTextWatermark(Image image)
    {
        //create a image object containing the photograph to watermark
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

    public async static Task<S3MetaData> UploadToS3(IUploadToS3Input input)
    {
        var memoryStream = new MemoryStream();

        var encoder = new JpegEncoder
        {
            Quality = input.ImageQuality // alter quality
        };

        input.Image.SaveAsJpeg(memoryStream, encoder);

        var credentials = new BasicAWSCredentials(input.AWSAccessKey, input.AWSSecretKey);
        var region = Amazon.RegionEndpoint.USEast1;
        var s3Client = new AmazonS3Client(credentials, region);

        using (memoryStream)
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = input.BucketName,
                Key = input.KeyName,
                InputStream = memoryStream,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
            };

            var size = memoryStream.Length;
            PutObjectResponse response = await s3Client.PutObjectAsync(putRequest);

            return new S3MetaData
            {
                Bucket = input.BucketName,
                Key = input.KeyName,
                Location = $"https://{input.BucketName}.s3.amazonaws.com/{input.KeyName}",
                ServerSideEncryption = ServerSideEncryptionMethod.AES256,
                ETag = response.ETag,
                Orientation = input.Orientation,
                Size = size
            };
        }
    }
}