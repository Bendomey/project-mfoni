using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using main.DTOs;

namespace main.Domains;

public class CollectionService
{
    private readonly ILogger<CollectionService> _logger;
    private readonly IMongoCollection<Models.Collection> _collectionCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;

    public CollectionService(
        ILogger<CollectionService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider
    )
    {
        _logger = logger;
        _collectionCollection = databaseConfig.Database.GetCollection<Models.Collection>(appConstants.Value.CollectionCollection);
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;

        logger.LogDebug("Collection service initialized");
    }

    public Models.Collection SaveCollection(SaveCollection input, string userId)
    {
        var oldCollection = _collectionCollection.Find(collection => collection.Name == input.Name).FirstOrDefault();
        if (oldCollection is not null)
        {
            throw new Exception("CollectionAlreadyExists");
        }

        var collection = new Models.Collection
        {
            Name = input.Name,
            ContentsCount = 0,
            Type = input.Type,
            Visibility = input.Visibility,
            Description = input.Description,
            CreatedById = userId
        };

        _collectionCollection.InsertOne(collection);

        return collection;
    }

    public Models.Collection GetCollection(string collectionId)
    {
        var collection = _collectionCollection.Find(collection => collection.Id == collectionId).FirstOrDefault();
        if (collection is null)
        {
            throw new Exception("CollectionNotFound");
        }

        return collection;
    }

    public Models.Collection ResolveCollection(SaveCollection input, string userId)
    {
        var collection = _collectionCollection.Find(collection => collection.Name == input.Name).FirstOrDefault();
        if (collection is null)
        {
            return this.SaveCollection(input, userId);
        }

        return collection;
    }

    public bool UpdateCollectionContentsCount(string collectionId, int count)
    {
        var collection = GetCollection(collectionId);
        if (collection is null)
        {
            throw new Exception("CollectionNotFound");
        }

        var filter = Builders<Models.Collection>.Filter.Eq(r => r.Id, collectionId);
        var updates = Builders<Models.Collection>.Update
            .Set(r => r.ContentsCount, collection.ContentsCount + count);

        _collectionCollection.UpdateOne(filter, updates);

        return true;
    }

}