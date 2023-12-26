using main.DTOs;
using main.Models;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Text;
using RabbitMQ.Client;

namespace main.Domains;

public class IndexContent
{

    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly RabbitMQConnection _rabbitMqConfiguration;
    private readonly AppConstants _appConstantsConfiguration;

    public IndexContent(ILogger<IndexContent> logger, IOptions<DatabaseSettings> bookStoreDatabaseSettings, IOptions<AppConstants> appConstants, IOptions<RabbitMQConnection> rabbitMQConnection)
    {
        _logger = logger;

        var database = connectToDatabase(bookStoreDatabaseSettings);

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);

        _rabbitMqConfiguration = rabbitMQConnection.Value;

        _appConstantsConfiguration = appConstants.Value;

        _logger.LogDebug("IndexContentService initialized");
    }

    private IMongoDatabase connectToDatabase(IOptions<DatabaseSettings> bookStoreDatabaseSettings)
    {
        var client = new MongoClient(bookStoreDatabaseSettings.Value.ConnectionString);
        return client.GetDatabase(bookStoreDatabaseSettings.Value.DatabaseName);
    }

    private IConnection CreateChannel()
    {
        ConnectionFactory connection = new ConnectionFactory()
        {
            UserName = _rabbitMqConfiguration.UserName,
            Password = _rabbitMqConfiguration.Password,
            HostName = _rabbitMqConfiguration.HostName
        };
        connection.DispatchConsumersAsync = true;
        var channel = connection.CreateConnection();
        return channel;
    }

    public string Index()
    {
        return "Hello World!";
    }


    public List<Content> Save(SaveMedia[] mediaInput)
    {
        List<Content> contents = [];

        mediaInput.ToList().ForEach(media =>
        {
            var content = new Content
            {
                Visibility = media.Visibility,
                Amount = Convert.ToInt32(media.Amount * 100),
                Media = media.Content,
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