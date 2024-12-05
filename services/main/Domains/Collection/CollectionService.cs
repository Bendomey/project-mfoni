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

    public Models.Collection SaveCollection(SaveCollection input)
    {
        var oldCollection = _collectionCollection.Find(collection => collection.Name == input.Name).FirstOrDefault();
        if (oldCollection is not null)
        {
            throw new Exception("CollectionAlreadyExists");
        }

        var collection = new Models.Collection
        {
            Name = input.Name,
            Slug = input.Slug,
            Description = input.Description,
            CreatedById = input.CreatedById
        };

        if (input.Visibility is not null)
        {
            collection.Visibility = input.Visibility;
        }

        if (input.CreatedByRole is not null)
        {
            collection.CreatedByRole = input.CreatedByRole;
        }

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

    public Models.Collection ResolveCollection(SaveCollection input)
    {
        var collection = _collectionCollection.Find(collection => collection.Name == input.Name).FirstOrDefault();
        if (collection is null)
        {
            return SaveCollection(input);
        }

        return collection;
    }

    public bool UpdateCollectionContentsCount(string collectionId, int count)
    {
        var filter = Builders<Models.Collection>.Filter.Eq(r => r.Id, collectionId);
        var updates = Builders<Models.Collection>.Update
            .Inc(r => r.ContentsCount, count);

        _collectionCollection.UpdateOne(filter, updates);

        return true;
    }

    public void BootstrapCollections()
    {
        _logger.LogInformation("Bootsrapping collections");
        string[] collections = { "Featured::Contents", "Featured::Tags", "Featured::Collections" };
        string collectionDescription = "Carefully curated collection of contents for your viewing pleasure by our team of experts at mfoni";

        foreach (var collection in collections)
        {
            ResolveCollection(new SaveCollection
            {
                Name = collection,
                Slug = $"{collection.ToLower().Replace("::", "_")}",
                Description = collectionDescription,

            });
        }
        _logger.LogInformation("Collections Bootstrapped now!");

    }

}