using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using main.Models;

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

    public Models.Collection SaveCollection(Domains.SaveCollection input)
    {
        var oldCollection = _collectionCollection.Find(collection => collection.Name == input.Name).FirstOrDefault();
        if (oldCollection is not null)
        {
            throw new HttpRequestException("CollectionAlreadyExists");
        }

        var collection = new Models.Collection
        {
            Name = input.Name,
            Slug = input.Slug,
            Description = input.Description,
            CreatedById = input.CreatedById,
            IsCustom = true
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

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
        });

        return collection;
    }

    public Models.Collection UpdateCollection(Domains.UpdateCollection input)
    {
        var filter = Builders<Models.Collection>.Filter.Eq(r => r.Id, input.Id);
        if (input.UserId is not null)
        {
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedById, input.UserId);
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedByRole, CollectionCreatedByRole.USER);
        }
        else
        {
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedByRole, CollectionCreatedByRole.SYSTEM);
        }

        var oldCollection = _collectionCollection.Find(filter).FirstOrDefault();
        if (oldCollection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        var oldName = oldCollection.Name;

        if (input.Name is not null)
        {
            oldCollection.Name = input.Name;
        }

        if (input.Description is not null)
        {
            oldCollection.Description = input.Description;
        }

        if (input.Visibility is not null)
        {
            oldCollection.Visibility = input.Visibility;
        }

        oldCollection.UpdatedAt = DateTime.UtcNow;
        _collectionCollection.ReplaceOne(filter, oldCollection);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*{input.Id}*",
            $"{CacheProvider.CacheEntities["collections"]}*{oldCollection.Slug}*",
            $"{CacheProvider.CacheEntities["collections"]}*{oldName}*",
        });

        return oldCollection;
    }

    public Models.Collection GetCollection(string collectionId)
    {
        var collection = _collectionCollection.Find(collection => collection.Id == collectionId).FirstOrDefault();
        if (collection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        return collection;
    }

    public Models.Collection GetCollectionByName(string collectionName)
    {
        var collection = _collectionCollection.Find(collection => collection.Name == collectionName).FirstOrDefault();
        if (collection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        return collection;
    }


    public Models.Collection GetCollectionBySlug(string slug)
    {
        var collection = _collectionCollection.Find(collection => collection.Slug == slug).FirstOrDefault();
        if (collection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        return collection;
    }

    public async Task<List<Models.Collection>> GetCollections(
        FilterQuery<Models.Collection> queryFilter,
        GetCollectionsInput input
    )
    {
        FilterDefinitionBuilder<Models.Collection> builder = Builders<Models.Collection>.Filter;
        var filter = builder.Eq(r => r.IsCustom, true);

        if (input.Visibility != "ALL")
        {
            filter &= builder.Eq(r => r.Visibility, input.Visibility);
        }

        if (!string.IsNullOrEmpty(input.CreatedById))
        {
            filter &= builder.Eq(r => r.CreatedById, input.CreatedById);
        }

        if (!string.IsNullOrEmpty(input.Query))
        {
            filter &= builder.Regex(r => r.Name, new MongoDB.Bson.BsonRegularExpression(input.Query, "i"));
        }

        var users = await _collectionCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return users ?? [];
    }

    public async Task<long> CountCollections(GetCollectionsInput input)
    {
        FilterDefinitionBuilder<Models.Collection> builder = Builders<Models.Collection>.Filter;
        var filter = builder.Eq(r => r.IsCustom, true);

        if (input.Visibility != "ALL")
        {
            filter &= builder.Eq(r => r.Visibility, input.Visibility);
        }

        if (!string.IsNullOrEmpty(input.CreatedById))
        {
            filter &= builder.Eq(r => r.CreatedById, input.CreatedById);
        }

        if (!string.IsNullOrEmpty(input.Query))
        {
            filter &= builder.Regex(r => r.Name, new MongoDB.Bson.BsonRegularExpression(input.Query, "i"));
        }

        var count = await _collectionCollection.CountDocumentsAsync(filter);

        return count;
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
        string[] collections = { "Featured::Contents", "Featured::Tags", "Featured::Collections", "Trending::Collections", "Popular::Tags", "Featured::Creators" };
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