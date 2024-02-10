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
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly RabbitMQ.Client.IConnection _rabbitMqChannel;
    private readonly SaveTags _saveTagsService;
    private readonly AppConstants _appConstantsConfiguration;

    public IndexContent(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, RabbitMQConnection rabbitMQChannel, IOptions<AppConstants> appConstants, SaveTags saveTagsService)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _userCollection = databaseConfig.Database.GetCollection<User>(appConstants.Value.UserCollection);

        _rabbitMqChannel = rabbitMQChannel.Channel;

        _appConstantsConfiguration = appConstants.Value;

        _saveTagsService = saveTagsService;

        _logger.LogDebug("IndexContentService initialized");
    }

    public List<Content> Save(SaveMedia[] mediaInput, string userId)
    {
        var user = _userCollection.Find(user => user.Id == userId).FirstOrDefault();
        if (user is null)
        {
            throw new Exception("UserNotFound");
        }

        // check if user is a creator
        if (user.Role != UserRole.CREATOR)
        {
            throw new Exception("NotEnoughPermission");
        }

        List<Content> contents = [];

        mediaInput.ToList().ForEach(media =>
        {
            var tags = new List<string>();
            var dbTags = _saveTagsService.ResolveTags(media.Tags ?? []);

            var content = new Content
            {
                Title = media.Title,
                Visibility = media.Visibility,
                Amount = Convert.ToInt32(media.Amount * 100),
                Media = media.Content,
                CreatedById = user.Id,
            };

            _contentsCollection.InsertOne(content);

            // save tags
            dbTags.ForEach(tag =>
            {
               var contentTag = new Models.ContenTag
               {
                   ContentId = content.Id,
                   TagId = tag.Id
               };
            });

            content.Tags = dbTags;

            contents.Add(content);
        });

        // push to queue for image processing
        using var channel = _rabbitMqChannel.CreateModel();

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