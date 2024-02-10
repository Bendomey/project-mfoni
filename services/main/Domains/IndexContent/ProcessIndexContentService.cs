using main.Configuratons;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Amazon.Rekognition;
using Amazon.Rekognition.Model;
using Amazon.Runtime;

namespace main.Domains;


public class ProcessIndexContent
{

    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly RabbitMQ.Client.IConnection _rabbitMqChannel;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IModel _model;

    private readonly AmazonRekognitionClient _rekognitionClient;

    public ProcessIndexContent(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, RabbitMQConnection rabbitMQChannel, IOptions<AppConstants> appConstants)
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
            // TODO  : send to sentry for triaging :)
            _logger.LogError($"Content with id:{contentId} not found");
            return;
        }

        try
        {
            // get blurred image with watermark and save to s3 when its a premium content.
            if (content.Amount > 0)
            {
                _logger.LogInformation("Creating blurred image with watermark...");
                await BlurImageAndSaveToS3(content);
                _logger.LogInformation("Successfully created blurred image with watermark");
            }

            // detect faces
            var detectFacesResponse = await DetectFaces(content);

            var faceDetailsLength = detectFacesResponse.FaceDetails.Count;
            _logger.LogInformation($"facesDetected: {faceDetailsLength}");

            if (faceDetailsLength == 0)
            {
                await UpdateContentWithNoProcess(content.Id, "No faces detected");

                return;
            }
            else
            {
                // check for nudity
                await CheckForNudity(content);

                // index face
                var indexFaceResponse = await IndexFace(content);

                var faces = indexFaceResponse.FaceRecords.Select(faceRecord => new RekognitionMetaDataFaceData
                {
                    ImageId = faceRecord.Face.ImageId,
                    FaceId = faceRecord.Face.FaceId,
                }).ToArray();

                _logger.LogInformation($"FacesResolved: {faces}");

                await SaveRekognitionContent(content.Id, faces);
                return;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error Occured: {ex.Message}");
            UpdateContentWithError(contentId, ex.Message);
            // TODO: send to sentry for triaging :)
        }
    }

    private async Task BlurImageAndSaveToS3(Content content)
    {
        try
        {
            // create watermark
            var newImage = await ProcessImage.AddTextWatermark(content.Media.Location);

            if (newImage is not null)
            {
                // reduce quantity && save to s3
                var imageResponse = await ProcessImage.UploadToS3(new IUploadToS3Input
                {
                    AWSAccessKey = _appConstantsConfiguration.AWSAccessKey,
                    AWSSecretKey = _appConstantsConfiguration.AWSSecretKey,
                    BucketName = _appConstantsConfiguration.BucketName,
                    Image = newImage,
                    KeyName = content.Media.Key,
                });

                // save to db
                var filter = Builders<Content>.Filter.Eq(r => r.Id, content.Id);
                var updates = Builders<Content>.Update
                    .Set(r => r.BlurredMedia, new S3MetaData
                    {
                        Bucket = imageResponse.Bucket,
                        ETag = imageResponse.ETag,
                        Key = imageResponse.Key,
                        Location = imageResponse.Location,
                        ServerSideEncryption = imageResponse.ServerSideEncryption,
                    })
                    .Set(r => r.UpdatedAt, DateTime.Now);

                await _contentsCollection.UpdateOneAsync(filter, updates);
            }

        }
        catch (System.Exception)
        {
            throw;
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
                throw new Exception(message);
            }
            else
            {
                _logger.LogInformation("No nudity detected, moving to next step");
            }
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
        var filter = Builders<Content>.Filter.Eq(r => r.Id, contentId);
        var updates = Builders<Content>.Update
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
        var filter = Builders<Content>.Filter.Eq(r => r.Id, contentId);
        var updates = Builders<Content>.Update
            .Set(r => r.RekognitionMetaData, new RekognitionMetaData
            {
                Status = RekognitionMetaDataStatus.NOT_INDEXED,
                ErrorDetails = new RekognitionMetaDataErrorDetails
                {
                    Message = message,
                }
            })
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
                ErrorDetails = new RekognitionMetaDataErrorDetails
                {
                    Message = message,
                }
            })
            .Set(r => r.Status, ContentStatus.REJECTED)
            .Set(r => r.RejectedAt, DateTime.Now)
            .Set(r => r.UpdatedAt, DateTime.Now);

        _contentsCollection.UpdateOne(filter, updates);
        return true;
    }
}