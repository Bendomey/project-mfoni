using main.DTOs;
using main.Models;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Text;
using RabbitMQ.Client;
using main.Lib;
using NanoidDotNet;
using System.Net;

namespace main.Domains;

public class IndexContent
{

    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly IMongoCollection<Models.TagContent> _tagContentCollection;
    private readonly RabbitMQ.Client.IConnection _rabbitMqChannel;
    private readonly SaveTagsService _saveTagsService;
    private readonly CollectionService _collectionService;
    private readonly PermissionService _permissionService;
    private readonly CollectionContentService _collectionContentService;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;

    public IndexContent(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, RabbitMQConnection rabbitMQChannel, IOptions<AppConstants> appConstants, SaveTagsService saveTagsService, CollectionService collectionService, CollectionContentService collectionContentService,
        CacheProvider cacheProvider,
        PermissionService permissionService
    )
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _userCollection = databaseConfig.Database.GetCollection<User>(appConstants.Value.UserCollection);
        _tagContentCollection = databaseConfig.Database.GetCollection<TagContent>(appConstants.Value.TagContentCollection);

        _rabbitMqChannel = rabbitMQChannel.Channel;

        _appConstantsConfiguration = appConstants.Value;

        _saveTagsService = saveTagsService;

        _collectionService = collectionService;
        _permissionService = permissionService;

        _collectionContentService = collectionContentService;
        _cacheProvider = cacheProvider;

        _logger.LogDebug("IndexContentService initialized");
    }

    public async Task<List<Content>> Save(SaveMedia[] mediaInput, CurrentUserOutput userInput)
    {
        // =============== PERMISSIONS CHECK =============================
        var userInfo = await _permissionService.CanUploadContent(userInput.Id, mediaInput.Length);

        var userUploadCollectionName = $"{userInput.Id}::Uploads";
        var userUploadCollectionSlug = userUploadCollectionName.Replace("::", "_").ToLower();

        // resolve upload collection
        var collection = _collectionService.ResolveCollection(new SaveCollection
        {
            Name = userUploadCollectionName,
            Slug = userUploadCollectionSlug,
            Description = $"{userInfo.User.Name}'s collection for all uploads",
            CreatedByRole = CollectionCreatedByRole.USER,
            CreatedById = userInfo.User.Id,
            IsCustom = false,
        });

        if (collection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        List<Content> contents = [];

        mediaInput.ToList().ForEach(media =>
        {
            var dbTags = _saveTagsService.ResolveTags(media.Tags ?? [], userInput);

            var content = new Content
            {
                Title = media.Title,
                Slug = $"{media.Title.ToLower().Replace(" ", "_")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 10)}",
                IntendedVisibility = media.Visibility,
                Amount = MoneyLib.ConvertCedisToPesewas(media.Amount),
                Media = media.Content,
                CreatedById = userInfo.User.Id,
            };

            _contentsCollection.InsertOne(content);

            // save tag contents
            var tagContents = dbTags.Select(tag => new Models.TagContent
            {
                ContentId = content.Id,
                TagId = tag.Id
            });

            if (tagContents is not null && tagContents.ToList().Count > 0)
            {
                _tagContentCollection.InsertMany(tagContents);
            }

            // create collection content
            _collectionContentService.SaveCollectionContent(new SaveCollectionContent
            {
                CollectionId = collection.Id,
                ContentId = content.Id,
                Type = CollectionContentType.CONTENT
            });

            dbTags.ForEach(tag =>
            {
                _ = _cacheProvider.EntityChanged(new[] {
                    $"{CacheProvider.CacheEntities["tags"]}*{tag.Id}",
                    $"{CacheProvider.CacheEntities["tags"]}*{tag.Slug}",
                    $"{CacheProvider.CacheEntities["tags"]}*{tag.Id}*contents*",
                    $"{CacheProvider.CacheEntities["tags"]}*{tag.Slug}*contents*",
                    $"{CacheProvider.CacheEntities["contents"]}*{content.Id}*tags*",
                });
            });

            contents.Add(content);
        });

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["contents"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["tags"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Id}*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Slug}*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Name}*",
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