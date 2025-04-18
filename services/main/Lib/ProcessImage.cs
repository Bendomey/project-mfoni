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
    public string? BackgroundColor { get; set; }
    public int ImageQuality { get; set; } = 85;
    public required string MfoniImagesUrl { get; set; }
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

    public async static Task<string> GenerateSignedAWSUrl(AmazonS3Client s3Client, Models.S3MetaData contentMedia)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = contentMedia.Bucket,
            Key = contentMedia.Key,
            Expires = DateTime.UtcNow.AddMinutes(5),
            Verb = HttpVerb.GET
        };

        string url = await s3Client.GetPreSignedURLAsync(request);
        return url;
    }

    public static Image AddTextWatermark(Image image)
    {
        //create a image object containing the photograph to watermark
        float[] alignments = [1.5f, 2.5f, 6.5f];

        var fontPath = Path.Combine(AppContext.BaseDirectory, "Assets", "Fonts", "PlusJakartaSans.ttf");
        FontCollection collection = new();
        FontFamily family = collection.Add(fontPath);

        Font font = family.CreateFont(100, FontStyle.Bold);

        alignments.ToList().ForEach(align =>
        {
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
                Location = $"{input.MfoniImagesUrl}/{input.KeyName}",
                ServerSideEncryption = ServerSideEncryptionMethod.AES256,
                ETag = response.ETag,
                BackgroundColor = input.BackgroundColor,
                Orientation = input.Orientation,
                Size = size
            };
        }
    }
}