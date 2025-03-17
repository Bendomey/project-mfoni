using main.Configuratons;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Amazon.Rekognition;
using Amazon.Runtime;
using main.Lib;
using Amazon.Rekognition.Model;
using Newtonsoft.Json;

namespace main.Domains;


public class ProcessIndexContent
{

    private readonly ILogger<ProcessIndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IConnection _rabbitMqChannel;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IModel _model;
    private readonly CacheProvider _cacheProvider;

    private readonly AmazonRekognitionClient _rekognitionClient;

    public ProcessIndexContent(ILogger<ProcessIndexContent> logger, DatabaseSettings databaseConfig, RabbitMQConnection rabbitMQChannel, IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider)
    {
        _logger = logger;

        _contentsCollection = databaseConfig.Database.GetCollection<Content>(appConstants.Value.ContentCollection);

        _rabbitMqChannel = rabbitMQChannel.Channel;

        _appConstantsConfiguration = appConstants.Value;

        _model = _rabbitMqChannel.CreateModel();

        // create queue if it does not exist.
        _model.QueueDeclare(
            queue: _appConstantsConfiguration.ProcessImageQueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );

        var credentials = new BasicAWSCredentials(_appConstantsConfiguration.AWSAccessKey, _appConstantsConfiguration.AWSSecretKey);
        var region = Amazon.RegionEndpoint.USEast1;
        _rekognitionClient = new AmazonRekognitionClient(credentials, region);
        _cacheProvider = cacheProvider;

        _logger.LogDebug("ProcessIndexContentService initialized");
    }

    public async Task ReadMessages()
    {
        var consumer = new AsyncEventingBasicConsumer(_model);
        consumer.Received += async (ch, ea) =>
        {
            var body = ea.Body.ToArray();
            var contentId = System.Text.Encoding.UTF8.GetString(body);
            _logger.LogInformation($"Processing:ContentId:{contentId}");
            await ProcessMessage(contentId);
            _logger.LogInformation($"Processed:ContentId:{contentId}");
            await Task.CompletedTask;
            _model.BasicAck(ea.DeliveryTag, true);
        };

        _model.BasicConsume(_appConstantsConfiguration.ProcessImageQueueName, false, consumer);
        await Task.CompletedTask;
    }

    private async Task ProcessMessage(string contentId)
    {
        var content = await GetContent(contentId);

        if (content == null)
        {
            _logger.LogError($"Content with id:{contentId} not found");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Processing Content Failed"},
                    {"contentId", contentId},
               });
               SentrySdk.CaptureException(new Exception($"Content with id:{contentId} not found"));
           });
            return;
        }

        try
        {
            // check for nudity
            await CheckForNudity(content);

            // resolve all image sizes
            var image = await ProcessImage.DownloadImage(content.Media.Location);

            if (image is not null)
            {
                await ResolveAllImages(content, image);
            }

            // detect faces
            var detectFacesResponse = await DetectFaces(content);

            var faceDetailsLength = detectFacesResponse.FaceDetails.Count;

            if (faceDetailsLength == 0)
            {
                await UpdateContentWithNoProcess(content.Id, "No faces detected");
            }
            else
            {
                // index face
                var indexFaceResponse = await IndexFace(content);

                var faces = indexFaceResponse.FaceRecords.Select(faceRecord => new RekognitionMetaDataFaceData
                {
                    ImageId = faceRecord.Face.ImageId,
                    FaceId = faceRecord.Face.FaceId,
                }).ToArray();


                await SaveRekognitionContent(content.Id, faces);
            }

            // index for textual search capabilities
            var processTextualSearchQueueHelper = new QueueHelper(
                _rabbitMqChannel, _appConstantsConfiguration.ProcessTextualSearchQueueName
            );

            var message = new
            {
                type = "CREATE",
                content_id = content.Id
            };

            processTextualSearchQueueHelper.PublishMessage(JsonConvert.SerializeObject(message));
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError($"HttpRequestException Occured: {ex.Message}");
            UpdateContentWithError(contentId, ex.Message);

        }
        catch (Exception ex)
        {
            _logger.LogError($"Exception Occured: {ex.Message}");
            UpdateContentWithError(contentId, "Something went wrong processing image. Please reach out to support");

            // this is a critical error, send to sentry
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Processing Content Failed"},
                    {"contentId", contentId},
               });
               SentrySdk.CaptureException(ex);
           });
        }
        finally
        {
            _ = _cacheProvider.EntityChanged(new[] {
                $"{CacheProvider.CacheEntities["contents"]}.find*",
                $"{CacheProvider.CacheEntities["collections"]}*contents*",
                $"{CacheProvider.CacheEntities["contents"]}*{content.Id}*",
                $"{CacheProvider.CacheEntities["contents"]}*{content.Slug}*",
            });
        }
    }

    private async Task SaveToDb(Content content, S3MetaData imageResponse, string field)
    {
        var filter = Builders<Content>.Filter.Eq(r => r.Id, content.Id);
        var updates = Builders<Content>.Update
            .Set(field, new S3MetaData
            {
                Bucket = imageResponse.Bucket,
                ETag = imageResponse.ETag,
                Key = imageResponse.Key,
                Location = imageResponse.Location,
                ServerSideEncryption = imageResponse.ServerSideEncryption,
                Orientation = imageResponse.Orientation,
                BackgroundColor = imageResponse.BackgroundColor,
                Size = imageResponse.Size,
            })
            .Set(r => r.UpdatedAt, DateTime.Now);

        await _contentsCollection.UpdateOneAsync(filter, updates);
    }

    private async Task ResolveAllImages(Content content, SixLabors.ImageSharp.Image image)
    {
        // NOTE: cloning for different sizes because I don't want to download the image everytime.
        var clonedImageForLarge = image;
        var clonedImageForMedium = image;
        var clonedImageForSmall = image;
        var clonedImageForBlur = image;

        // save for large
        var imageResponseForLarge = await ProcessImage.UploadToS3(new IUploadToS3Input
        {
            AWSAccessKey = _appConstantsConfiguration.AWSAccessKey,
            AWSSecretKey = _appConstantsConfiguration.AWSSecretKey,
            BucketName = _appConstantsConfiguration.BucketName,
            Image = clonedImageForLarge,
            KeyName = $"large_{content.Media.Key}",
            Orientation = content.Media.Orientation,
            BackgroundColor = content.Media.BackgroundColor,
            ImageQuality = 85,
        });
        await SaveToDb(content, imageResponseForLarge, "large_media");

        // save for medium
        var imageResponseForMedium = await ProcessImage.UploadToS3(new IUploadToS3Input
        {
            AWSAccessKey = _appConstantsConfiguration.AWSAccessKey,
            AWSSecretKey = _appConstantsConfiguration.AWSSecretKey,
            BucketName = _appConstantsConfiguration.BucketName,
            Image = clonedImageForMedium,
            KeyName = $"medium_{content.Media.Key}",
            Orientation = content.Media.Orientation,
            BackgroundColor = content.Media.BackgroundColor,
            ImageQuality = 75,
        });
        await SaveToDb(content, imageResponseForMedium, "medium_media");

        // save for small
        var imageResponseForSmall = await ProcessImage.UploadToS3(new IUploadToS3Input
        {
            AWSAccessKey = _appConstantsConfiguration.AWSAccessKey,
            AWSSecretKey = _appConstantsConfiguration.AWSSecretKey,
            BucketName = _appConstantsConfiguration.BucketName,
            Image = clonedImageForSmall,
            KeyName = $"small_{content.Media.Key}",
            Orientation = content.Media.Orientation,
            BackgroundColor = content.Media.BackgroundColor,
            ImageQuality = 65,
        });
        await SaveToDb(content, imageResponseForSmall, "small_media");

        if (content.Amount > 0)
        {
            var blurredImage = ProcessImage.AddTextWatermark(clonedImageForBlur);
            var imageResponse = await ProcessImage.UploadToS3(new IUploadToS3Input
            {
                AWSAccessKey = _appConstantsConfiguration.AWSAccessKey,
                AWSSecretKey = _appConstantsConfiguration.AWSSecretKey,
                BucketName = _appConstantsConfiguration.BucketName,
                Image = blurredImage,
                KeyName = $"blurred_{content.Media.Key}",
                Orientation = content.Media.Orientation,
                BackgroundColor = content.Media.BackgroundColor,
                ImageQuality = 85,
            });

            await SaveToDb(content, imageResponse, "blurred_media");
        }
    }

    public async Task CheckForNudity(Content content)
    {
        var image = new Image
        {
            S3Object = new S3Object
            {
                Bucket = content.Media.Bucket,
                Name = content.Media.Key,
            }
        };

        var request = new DetectModerationLabelsRequest
        {
            Image = image,
            MinConfidence = 50 // Adjust confidence threshold as needed
        };

        try
        {
            var response = await _rekognitionClient.DetectModerationLabelsAsync(request);
            if (response.ModerationLabels.Count > 0)
            {
                var moderationLabels = response.ModerationLabels.Select(label => label.Name).ToArray();
                var message = $"Nudity detected: {string.Join(",", moderationLabels)}";
                _logger.LogInformation(message);
                throw new HttpRequestException(message);
            }

            _logger.LogInformation("No nudity detected, moving to next step");
        }
        catch (AmazonRekognitionException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    private async Task<DetectFacesResponse> DetectFaces(Content content)
    {
        var detectFacesRequest = new DetectFacesRequest
        {
            Image = new Image
            {
                S3Object = new S3Object
                {
                    Bucket = content.Media.Bucket,
                    Name = content.Media.Key,
                }
            },
            Attributes = new List<string>
            {
                "ALL"
            },
        };

        var response = await _rekognitionClient.DetectFacesAsync(detectFacesRequest);
        return response;
    }

    private async Task<IndexFacesResponse> IndexFace(Content content)
    {
        var indexFacesRequest = new IndexFacesRequest
        {
            CollectionId = _appConstantsConfiguration.AWSRekognitionCollection,
            DetectionAttributes = new List<string>
            {
                "ALL"
            },
            ExternalImageId = content.Id,
            Image = new Image
            {
                S3Object = new S3Object
                {
                    Bucket = content.Media.Bucket,
                    Name = content.Media.Key,
                }
            },
        };

        var response = await _rekognitionClient.IndexFacesAsync(indexFacesRequest);
        return response;
    }

    private async Task<Content?> GetContent(string contentId)
    {
        try
        {
            var filter = Builders<Content>.Filter.Eq(r => r.Id, contentId);
            var content = await _contentsCollection.Find(filter).FirstOrDefaultAsync();

            return content;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            throw;
        }
    }

    private async Task<bool> SaveRekognitionContent(string contentId, RekognitionMetaDataFaceData[] faceMetaData)
    {
        var content = await _contentsCollection.Find(r => r.Id == contentId).FirstOrDefaultAsync();

        var filter = Builders<Content>.Filter.Eq(r => r.Id, contentId);
        var updates = Builders<Content>.Update
            .Set(r => r.Visibility, content.IntendedVisibility)
            .Unset(r => r.IntendedVisibility)
            .Set(r => r.Status, ContentStatus.DONE)
            .Set(r => r.DoneAt, DateTime.Now)
            .Set(r => r.UpdatedAt, DateTime.Now)
            .Set(r => r.RekognitionMetaData, new RekognitionMetaData
            {
                Status = RekognitionMetaDataStatus.INDEXED,
                FaceData = faceMetaData,
            });

        await _contentsCollection.UpdateOneAsync(filter, updates);
        return true;
    }

    private async Task<bool> UpdateContentWithNoProcess(string contentId, string message)
    {
        var content = await _contentsCollection.Find(r => r.Id == contentId).FirstOrDefaultAsync();

        var filter = Builders<Content>.Filter.Eq(r => r.Id, contentId);
        var updates = Builders<Content>.Update
            .Set(r => r.RekognitionMetaData, new RekognitionMetaData
            {
                Status = RekognitionMetaDataStatus.NOT_INDEXED,
                Details = new RekognitionMetaDataDetails
                {
                    Message = message,
                }
            })
            .Set(r => r.Visibility, content.IntendedVisibility)
            .Unset(r => r.IntendedVisibility)
            .Set(r => r.Status, ContentStatus.DONE)
            .Set(r => r.DoneAt, DateTime.Now)
            .Set(r => r.UpdatedAt, DateTime.Now);

        await _contentsCollection.UpdateOneAsync(filter, updates);
        return true;
    }

    private bool UpdateContentWithError(string contentId, string message)
    {
        var filter = Builders<Content>.Filter.Eq(r => r.Id, contentId);
        var updates = Builders<Content>.Update
            .Set(r => r.RekognitionMetaData, new RekognitionMetaData
            {
                Status = RekognitionMetaDataStatus.FAILED,
                Details = new RekognitionMetaDataDetails
                {
                    Message = message,
                }
            })
            .Unset(r => r.IntendedVisibility) // remove visibility and leave main visibility as private.
            .Set(r => r.Status, ContentStatus.REJECTED)
            .Set(r => r.RejectedAt, DateTime.Now)
            .Set(r => r.UpdatedAt, DateTime.Now);

        _contentsCollection.UpdateOne(filter, updates);
        return true;
    }
}