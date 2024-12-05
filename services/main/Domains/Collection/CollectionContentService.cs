using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using MongoDB.Bson;

namespace main.Domains;

public class CollectionContentService
{
    private readonly CollectionService _collectionService;
    private readonly ILogger<CollectionContentService> _logger;
    private readonly IMongoCollection<Models.CollectionContent> _collectionContentCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;

    public CollectionContentService(
        ILogger<CollectionContentService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider,
        CollectionService collectionService
    )
    {
        _logger = logger;
        _collectionContentCollection = databaseConfig.Database.GetCollection<Models.CollectionContent>(appConstants.Value.CollectionContentCollection);
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;
        _collectionService = collectionService;

        logger.LogDebug("Collection Content service initialized");
    }

    public Models.CollectionContent SaveCollectionContent(SaveCollectionContent input)
    {
        var filter = Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);

        if (input.TagId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.TagId, input.TagId);
        }
        else if (input.ChildCollectionId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ChildCollectionId, input.ChildCollectionId);
        }
        else if (input.ContentId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ContentId, input.ContentId);
        }

        var oldCollectionContent = _collectionContentCollection.Find(filter).FirstOrDefault();

        if (oldCollectionContent is not null)
        {
            throw new HttpRequestException("CollectionContentAlreadyExists");
        }

        var collection = new Models.CollectionContent
        {
            CollectionId = input.CollectionId,
            Type = input.Type,
            ContentId = input.ContentId,
        };

        _collectionContentCollection.InsertOne(collection);
        _collectionService.UpdateCollectionContentsCount(collection.Id, 1);

        return collection;
    }

    public Models.CollectionContent GetCollection(string collectionId)
    {
        var collectionContent = _collectionContentCollection.Find(collection => collection.Id == collectionId).FirstOrDefault();
        if (collectionContent is null)
        {
            throw new HttpRequestException("CollectionContentNotFound");
        }

        return collectionContent;
    }

    public async Task<List<Models.CollectionContent>> GetCollectionContents(
        FilterQuery<Models.CollectionContent> queryFilter,
        GetCollectionContentsInput input
    )
    {
        var filter = Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);

        if (input.CollectionId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);
        }

        if (input.TagId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.TagId, input.TagId);
        }

        if (input.ChildCollectionId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ChildCollectionId, input.ChildCollectionId);
        }

        if (input.ContentId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ContentId, input.ContentId);
        }

        var users = await _collectionContentCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return users ?? [];
    }

    public async Task<long> CountCollectionContents(GetCollectionContentsInput input)
    {
        var filter = Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);

        if (input.CollectionId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);
        }

        if (input.TagId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.TagId, input.TagId);
        }

        if (input.ChildCollectionId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ChildCollectionId, input.ChildCollectionId);
        }

        if (input.ContentId is not null)
        {
            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ContentId, input.ContentId);
        }


        long count = await _collectionContentCollection.CountDocumentsAsync(filter);
        return count;
    }

}