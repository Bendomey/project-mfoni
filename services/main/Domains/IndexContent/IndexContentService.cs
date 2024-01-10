using main.DTOs;
using main.Models;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Text;
using RabbitMQ.Client;
using System.Net.Security;

namespace main.Domains;

public class IndexContent
{

    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly RabbitMQConnection _rabbitMqConfiguration;
    private readonly SaveTags _saveTagsService;
    private readonly AppConstants _appConstantsConfiguration;

    public IndexContent(ILogger<IndexContent> logger, IOptions<DatabaseSettings> mfoniStoreDatabaseSettings, IOptions<AppConstants> appConstants, IOptions<RabbitMQConnection> rabbitMQConnection, SaveTags saveTagsService)
    {
        _logger = logger;

        var database = connectToDatabase(mfoniStoreDatabaseSettings);

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);

        _rabbitMqConfiguration = rabbitMQConnection.Value;

        _appConstantsConfiguration = appConstants.Value;

        _saveTagsService = saveTagsService;

        _logger.LogDebug("IndexContentService initialized");
    }

    private IMongoDatabase connectToDatabase(IOptions<DatabaseSettings> mfoniStoreDatabaseSettings)
    {
        var client = new MongoClient(mfoniStoreDatabaseSettings.Value.ConnectionString);
        return client.GetDatabase(mfoniStoreDatabaseSettings.Value.DatabaseName);
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

    public List<Content> Save(SaveMedia[] mediaInput)
    {
        List<Content> contents = [];

        mediaInput.ToList().ForEach(media =>
        {
            var tags = new List<string>();
            var dbTags = _saveTagsService.ResolveTags(media.Tags ?? []);

            var content = new Content
            {
                Visibility = media.Visibility,
                Amount = Convert.ToInt32(media.Amount * 100),
                Media = media.Content,
                Tags =  dbTags.Select(tag => tag.Id).ToList()
            };

            _contentsCollection.InsertOne(content);

            contents.Add(content);
        });

        // push to queue for image processing
        using var connection = CreateChannel();
        using var channel = connection.CreateModel();

        channel.QueueDeclare(
            queue: _appConstantsConfiguration.ProcessImageQueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );

        contents.ToList().ForEach(content =>
        {
            _logger.LogInformation($"Sending message to queue: {content.Id}", content.Id);
            string message = content.Id;
            var body = Encoding.UTF8.GetBytes(message);

            channel.BasicPublish(
                exchange: "",
                routingKey: _appConstantsConfiguration.ProcessImageQueueName,
                basicProperties: null,
                body: body
            );
        });

        return contents;
    }
}