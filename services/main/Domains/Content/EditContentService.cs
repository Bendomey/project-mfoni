

using main.Configuratons;
using main.Domains;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Newtonsoft.Json;

public class EditContentService
{
    private readonly ILogger<EditContentService> _logger;
    private readonly PermissionService _permissionService;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly CreatorService _creatorService;
    private readonly QueueHelper _processTextualSearchQueueHelper;

    public EditContentService(
        ILogger<EditContentService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider,
        PermissionService permissionService,
        RabbitMQConnection rabbitMQChannel,
        CreatorService creatorService
    )
    {
        _logger = logger;
        var database = databaseConfig.Database;
        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _cacheProvider = cacheProvider;
        _permissionService = permissionService;
        _creatorService = creatorService;

        _processTextualSearchQueueHelper = new QueueHelper(
            rabbitMQChannel.Channel, appConstants.Value.ProcessTextualSearchQueueName
        );


        logger.LogDebug("EditContentService service initialized");
    }

    public async Task<Content> EditContent(EditContentBasicDetailsInput input)
    {
        var filter = Builders<Content>.Filter.Eq(r => r.Id, input.ContentId);
        filter &= Builders<Content>.Filter.Eq(r => r.CreatedById, input.UserId);

        var content = await _contentsCollection.Find(filter).FirstOrDefaultAsync();
        if (content is null)
        {
            throw new HttpRequestException("ContentNotFound");
        }

        if (!string.IsNullOrEmpty(input.Title))
        {
            content.Title = input.Title;
        }

        if (!string.IsNullOrEmpty(input.Visibility))
        {
            if (input.Visibility == ContentVisibility.PRIVATE)
            {
                content.Visibility = input.Visibility;
            }
            else if (input.Visibility == ContentVisibility.PUBLIC)
            {
                // make sure the content is done before making it public
                if (content.Status != ContentStatus.DONE)
                {
                    throw new HttpRequestException("ContentCannotBeMadePublic");
                }

                content.IntendedVisibility = input.Visibility;
            }
        }

        if (input.Amount.HasValue)
        {
            if (input.Amount < 0)
            {
                throw new HttpRequestException("InvalidAmount");
            }

            if (input.Amount == 0)
            {
                content.Amount = 0;
            }
            else
            {
                var creatorInfo = await _creatorService.GetCreatorDetails(input.UserId);
                var isAPremiumCreator = _permissionService.IsAPremiumCreator(creatorInfo);
                if (!isAPremiumCreator)
                {
                    throw new HttpRequestException("OnlyPremiumCreatorsCanSetAmount", default, System.Net.HttpStatusCode.Forbidden);
                }
                content.Amount = MoneyLib.ConvertCedisToPesewas(input.Amount.Value);
            }
        }

        content.UpdatedAt = DateTime.UtcNow;
        _contentsCollection.ReplaceOne(filter, content);

        // persist changes to search index
        var message = new
        {
            type = "UPDATE_BASIC",
            content_id = content.Id
        };

        _processTextualSearchQueueHelper.PublishMessage(JsonConvert.SerializeObject(message));

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["contents"]}.find*",
            $"{CacheProvider.CacheEntities["contents"]}*{input.ContentId}*",
            $"{CacheProvider.CacheEntities["contents"]}*{content.Slug}*",
        });

        return content;
    }
}