using main.DTOs;
using main.Models;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Text;
using RabbitMQ.Client;
using main.Lib;
using NanoidDotNet;

namespace main.Domains;

public class IndexContent
{

    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly RabbitMQ.Client.IConnection _rabbitMqChannel;
    private readonly SaveTagsService _saveTagsService;
    private readonly CollectionService _collectionService;
    private readonly CollectionContentService _collectionContentService;
    private readonly AppConstants _appConstantsConfiguration;

    public IndexContent(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, RabbitMQConnection rabbitMQChannel, IOptions<AppConstants> appConstants, SaveTagsService saveTagsService, CollectionService collectionService, CollectionContentService collectionContentService)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _userCollection = databaseConfig.Database.GetCollection<User>(appConstants.Value.UserCollection);

        _rabbitMqChannel = rabbitMQChannel.Channel;

        _appConstantsConfiguration = appConstants.Value;

        _saveTagsService = saveTagsService;

        _collectionService = collectionService;

        _collectionContentService = collectionContentService;

        _logger.LogDebug("IndexContentService initialized");
    }

    public List<Content> Save(SaveMedia[] mediaInput, CurrentUserOutput userInput)
    {
        var user = _userCollection.Find(user => user.Id == userInput.Id).FirstOrDefault();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        // check if user is a creator
        // TODO: work on enforcing in my next EPIC
        // if (user.Role != UserRole.CREATOR)
        // {
        //     throw new HttpRequestException("NotEnoughPermission");
        // }

        // resolve upload collection
        var collection = _collectionService.ResolveCollection(new SaveCollection
        {
            Name = $"{user.Id}::Uploads",
            Slug = $"{user.Name.ToLower().Replace(" ", "_")}_uploads_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 10)}",
            Description = $"{user.Name}'s collection for all their uploads",
            CreatedByRole = CollectionCreatedByRole.USER,
            CreatedById = user.Id
        });

        if (collection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        List<Content> contents = [];

        mediaInput.ToList().ForEach(media =>
        {
            var tags = new List<string>();
            var dbTags = _saveTagsService.ResolveTags(media.Tags ?? [], userInput);

            var content = new Content
            {
                Title = media.Title,
                Slug = $"{media.Title.ToLower().Replace(" ", "_")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 10)}",
                Visibility = media.Visibility,
                Amount = MoneyLib.ConvertCedisToPesewas(Convert.ToInt64(media.Amount)),
                Media = media.Content,
                CreatedById = user.Id,
            };

            _contentsCollection.InsertOne(content);

            // save tags
            dbTags.ForEach(tag =>
            {
                var contentTag = new Models.ContentTag
                {
                    ContentId = content.Id,
                    TagId = tag.Id
                };
            });

            // create collection content
            _collectionContentService.SaveCollectionContent(new SaveCollectionContent
            {
                CollectionId = collection.Id,
                ContentId = content.Id,
                Type = CollectionContentType.CONTENT
            });

            contents.Add(content);
        });

        // save count on collection
        _collectionService.UpdateCollectionContentsCount(collection.Id, contents.Count);

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