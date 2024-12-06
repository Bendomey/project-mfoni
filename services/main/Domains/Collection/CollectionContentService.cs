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
            // if content is available
            var oldContent = _contentCollection.Find(Builders<Content>.Filter.Eq(r => r.Id, contentId.Id)).FirstOrDefault();

            if (oldContent is null)
            {
                continue;
            }

            // if collectionContent already available
            var collectionContentFilter = Builders<CollectionContent>.Filter.Eq(r => r.CollectionId, input.Id);
            collectionContentFilter &= Builders<CollectionContent>.Filter.Eq(r => r.ContentId, contentId.Id);

            var oldCollectionContent = _collectionContentCollection.Find(collectionContentFilter).FirstOrDefault();

            if (oldCollectionContent is not null)
            {
                continue;
            }

            var collectionContent = new CollectionContent
            {
                CollectionId = input.Id,
                ContentId = contentId.Id,
                Type = contentId.Type
            };

            _collectionContentCollection.InsertOne(collectionContent);
            collectionContents.Add(collectionContent);
        }

        _collectionService.UpdateCollectionContentsCount(input.Id, collectionContents.Count);

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
            collectionContents.Add(oldCollectionContent);
        }

        _collectionService.UpdateCollectionContentsCount(input.Id, -collectionContents.Count);
        return true;
    }

}