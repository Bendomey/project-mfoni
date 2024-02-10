using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using main.DTOs;

namespace main.Domains;

public class CollectionContentService
{
    private readonly ILogger<CollectionContentService> _logger;
    private readonly IMongoCollection<Models.CollectionContent> _collectionContentCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;

    public CollectionContentService(
        ILogger<CollectionContentService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider
    )
    {
        _logger = logger;
        _collectionContentCollection = databaseConfig.Database.GetCollection<Models.CollectionContent>(appConstants.Value.CollectionContentCollection);
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;

        logger.LogDebug("Collection Content service initialized");
    }

    public Models.CollectionContent SaveCollectionContent(SaveCollectionContent input, string userId)
    {
        var filter = Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);
        filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ContentId, input.ContentId);

        var oldCollection = _collectionContentCollection.Find(filter).FirstOrDefault();
        
        if (oldCollection is not null)
        {
            throw new Exception("CollectionContentAlreadyExists");
        }

        var collection = new Models.CollectionContent
        {
            CollectionId = input.CollectionId,
            ContentId = input.ContentId,
            CreatedById = userId
        };

        _collectionContentCollection.InsertOne(collection);

        return collection;
    }

    public Models.CollectionContent GetCollection(string collectionId)
    {
        var collectionContent = _collectionContentCollection.Find(collection => collection.Id == collectionId).FirstOrDefault();
        if (collectionContent is null)
        {
            throw new Exception("CollectionContentNotFound");
        }

        return collectionContent;
    }
    
}