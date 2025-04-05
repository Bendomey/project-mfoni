using main.DTOs;
using main.Models;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Lib;

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
    private readonly CreatorService _creatorService;
    private readonly CollectionContentService _collectionContentService;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;

    public IndexContent(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, RabbitMQConnection rabbitMQChannel, IOptions<AppConstants> appConstants, SaveTagsService saveTagsService, CollectionService collectionService, CollectionContentService collectionContentService,
        CacheProvider cacheProvider,
        PermissionService permissionService,
        CreatorService creatorService
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
        _creatorService = creatorService;

        _logger.LogDebug("IndexContentService initialized");
    }

    public async Task<List<Content>> Save(SaveMedia[] mediaInput, CurrentUserOutput userInput)
    {
        var creatorInfo = await this._creatorService.GetCreatorDetails(userInput.Id);

        // =============== START PERMISSIONS CHECK =============================
        var isACreator = _permissionService.IsACreator(creatorInfo);
        if (!isACreator)
        {
            throw new HttpRequestException("NotACreator", null, System.Net.HttpStatusCode.Forbidden);
        }

        var numberOfContentsCreatorHasUploaded = await _permissionService.GetMonthlyUploadLimit(creatorInfo);
        numberOfContentsCreatorHasUploaded += mediaInput.Length;

        var contentsCreatorCanUpload = PermissionsHelper.GetNumberOfUploadsForPackageType(creatorInfo.CreatorSubscription.PackageType);
        if (contentsCreatorCanUpload is not null && numberOfContentsCreatorHasUploaded > contentsCreatorCanUpload)
        {
            throw new HttpRequestException("UploadLimitReached", null, System.Net.HttpStatusCode.Forbidden);
        }
        // =============== END PERMISSIONS CHECK =============================

        var userUploadCollectionName = $"{userInput.Id}::Uploads";
        var userUploadCollectionSlug = userUploadCollectionName.Replace("::", "_").ToLower();

        // resolve upload collection
        var collection = _collectionService.ResolveCollection(new SaveCollection
        {
            Name = userUploadCollectionName,
            Slug = userUploadCollectionSlug,
            Description = $"{creatorInfo.User.Name}'s collection for all uploads",
            CreatedByRole = CollectionCreatedByRole.USER,
            CreatedById = creatorInfo.User.Id,
            IsCustom = false,
        });

        if (collection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        var contents = new List<Content>();

        var canCreatorPriceContent = _permissionService.CanCreatorPriceContent(creatorInfo);

        mediaInput.ToList().ForEach(media =>
        {
            var dbTags = _saveTagsService.ResolveTags(media.Tags ?? [], userInput);

            var content = new Content
            {
                Title = media.Title,
                Slug = StringLib.GenerateSlug(media.Title),
                IntendedVisibility = media.Visibility,
                Amount = canCreatorPriceContent ? MoneyLib.ConvertCedisToPesewas(media.Amount) : 0,
                Media = media.Content,
                CreatedById = creatorInfo.User.Id,
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
        var processContentQueueHelper = new QueueHelper(_rabbitMqChannel, _appConstantsConfiguration.ProcessImageQueueName);

        contents.ToList().ForEach(content =>
        {
            _logger.LogInformation($"Sending message to queue: {content.Id}", content.Id);
            string message = content.Id;

            processContentQueueHelper.PublishMessage(message);
        });

        return contents;
    }
}