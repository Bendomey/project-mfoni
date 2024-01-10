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
    private readonly RabbitMQConnection _rabbitMqConfiguration;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IModel _model;

    private readonly AmazonRekognitionClient _rekognitionClient;

    public ProcessIndexContent(ILogger<IndexContent> logger, IOptions<DatabaseSettings> bookStoreDatabaseSettings, IOptions<AppConstants> appConstants, IOptions<RabbitMQConnection> rabbitMQConnection)
    {
        _logger = logger;

        _contentsCollection = connectToDatabase(bookStoreDatabaseSettings, appConstants);

        _rabbitMqConfiguration = rabbitMQConnection.Value;

        _appConstantsConfiguration = appConstants.Value;

        var _connection = CreateChannel();

        _model = _connection.CreateModel();

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

    private IMongoCollection<Content> connectToDatabase(IOptions<DatabaseSettings> bookStoreDatabaseSettings, IOptions<AppConstants> appConstants)
    {
        var client = new MongoClient(bookStoreDatabaseSettings.Value.ConnectionString);
        var database = client.GetDatabase(bookStoreDatabaseSettings.Value.DatabaseName);
        return database.GetCollection<Content>(appConstants.Value.ContentCollection);
    }

    private IConnection CreateChannel()
    {
        ConnectionFactory connection = new ConnectionFactory()
        {
            Uri = new Uri(_rabbitMqConfiguration.Uri)
        };
        connection.DispatchConsumersAsync = true;
        var channel = connection.CreateConnection();
        return channel;
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

        // detect faces
        try
        {
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

                // index face
                try
                {
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
                catch (Exception ex)
                {
                    _logger.LogError($"ErrorIndexing: {ex.Message}");
                    // TODO: send to sentry for triaging :) 
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"ErrorDetecting: {ex.Message}");
            // TODO: send to sentry for triaging :) 
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
            .Set(r => r.Status, "DONE")
            .Set(r => r.DoneAt, DateTime.Now)
            .Set(r => r.UpdatedAt, DateTime.Now)
            .Set(r => r.RekognitionMetaData, new RekognitionMetaData
            {
                Status = "INDEXED",
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
                Status = "NOT_INDEXED",
                ErrorDetails = new RekognitionMetaDataErrorDetails
                {
                    Message = message,
                }
            })
            .Set(r => r.Status, "DONE")
            .Set(r => r.DoneAt, DateTime.Now)
            .Set(r => r.UpdatedAt, DateTime.Now);
        await _contentsCollection.UpdateOneAsync(filter, updates);
        return true;
    }
}