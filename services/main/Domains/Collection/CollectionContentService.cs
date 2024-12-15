using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using MongoDB.Bson;
using main.Models;

namespace main.Domains;

public class CollectionContentService
{
    private readonly CollectionService _collectionService;
    private readonly ILogger<CollectionContentService> _logger;
    private readonly IMongoCollection<Models.CollectionContent> _collectionContentCollection;
    private readonly IMongoCollection<Models.Collection> _collectionCollection;
    private readonly IMongoCollection<Models.Content> _contentCollection;
    private readonly IMongoCollection<Models.Tag> _tagCollection;
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
        _collectionCollection = databaseConfig.Database.GetCollection<Models.Collection>(appConstants.Value.CollectionCollection);
        _contentCollection = databaseConfig.Database.GetCollection<Models.Content>(appConstants.Value.ContentCollection);
        _tagCollection = databaseConfig.Database.GetCollection<Models.Tag>(appConstants.Value.TagCollection);
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;
        _collectionService = collectionService;

        logger.LogDebug("Collection Content service initialized");
    }

    public Models.CollectionContent SaveCollectionContent(SaveCollectionContent input)
    {
        var collection = _collectionService.GetCollection(input.CollectionId);

        var filter = Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);

        if (input.TagId is not null)
        {
            var tag = _tagCollection.Find(Builders<Models.Tag>.Filter.Eq(r => r.Id, input.TagId)).FirstOrDefault();

            if (tag is not null)
            {
                throw new HttpRequestException("ContentNotFound");
            }

            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.TagId, input.TagId);
        }
        else if (input.ChildCollectionId is not null)
        {
            var content = _collectionCollection.Find(Builders<Collection>.Filter.Eq(r => r.Id, input.ChildCollectionId)).FirstOrDefault();

            if (content is not null)
            {
                throw new HttpRequestException("ChildCollectionNotFound");
            }

            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ChildCollectionId, input.ChildCollectionId);
        }
        else if (input.ContentId is not null)
        {
            var content = _contentCollection.Find(Builders<Content>.Filter.Eq(r => r.Id, input.ContentId)).FirstOrDefault();

            if (content is not null)
            {
                throw new HttpRequestException("ContentNotFound");
            }

            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ContentId, input.ContentId);
        }

        var oldCollectionContent = _collectionContentCollection.Find(filter).FirstOrDefault();

        if (oldCollectionContent is not null)
        {
            throw new HttpRequestException("CollectionContentAlreadyExists");
        }

        var collectionContent = new Models.CollectionContent
        {
            CollectionId = input.CollectionId,
            Type = input.Type,
            ContentId = input.ContentId,
            TagId = input.TagId,
            ChildCollectionId = input.ChildCollectionId
        };

        _collectionContentCollection.InsertOne(collectionContent);

        _collectionService.UpdateCollectionContentsCount(input.CollectionId, 1);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*${collection.Id}*",
            $"{CacheProvider.CacheEntities["collections"]}*${collection.Slug}*",
            $"{CacheProvider.CacheEntities["collections"]}*${collection.Name}*",
            $"{CacheProvider.CacheEntities["collections"]}*contents*",
        });

        return collectionContent;
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
        // TODO: Add support for license and orientation filters for image/video content
        // TODO: add support for visibility filter for content
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

        var contents = await _collectionContentCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return contents ?? [];
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

    public List<CollectionContent> AddContentsToCollection(AddContentsToCollectionInput input)
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

        var collectionContents = new List<CollectionContent>();

        foreach (var contentId in input.ContentIds)
        {

            try
            {
                var collectionContent = SaveCollectionContent(new SaveCollectionContent
                {
                    CollectionId = input.Id,
                    ContentId = contentId.Type == CollectionContentType.CONTENT ? contentId.Id : null,
                    Type = contentId.Type,
                    TagId = contentId.Type == CollectionContentType.TAG ? contentId.Id : null,
                    ChildCollectionId = contentId.Type == CollectionContentType.COLLECTION ? contentId.Id : null
                });
                collectionContents.Add(collectionContent);
            }
            catch (System.Exception)
            {
                continue;
            }
        }

        return collectionContents;
    }

    public bool RemoveContentsFromCollection(RemoveContentsFromCollectionInput input)
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

        var collectionContents = new List<CollectionContent>();

        foreach (var contentId in input.ContentIds)
        {
            // if collectionContent is available
            var collectionContentFilter = Builders<CollectionContent>.Filter.Eq(r => r.CollectionId, input.Id);
            collectionContentFilter &= Builders<CollectionContent>.Filter.Eq(r => r.ContentId, contentId);

            var oldCollectionContent = _collectionContentCollection.Find(collectionContentFilter).FirstOrDefault();

            if (oldCollectionContent is null)
            {
                continue;
            }
            _collectionContentCollection.DeleteOne(collectionContentFilter);
            var collection = _collectionCollection.Find(Builders<Models.Collection>.Filter.Eq(r => r.Id, oldCollectionContent.CollectionId)).FirstOrDefault();

            _ = _cacheProvider.EntityChanged(new[] {
                $"{CacheProvider.CacheEntities["collections"]}*${collection.Id}*",
                $"{CacheProvider.CacheEntities["collections"]}*${collection.Slug}*",
                $"{CacheProvider.CacheEntities["collections"]}*${collection.Name}*",
            });

            collectionContents.Add(oldCollectionContent);
        }

        _collectionService.UpdateCollectionContentsCount(input.Id, -collectionContents.Count);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*contents*",
        });
        return true;
    }

}