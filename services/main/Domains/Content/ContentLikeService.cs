

using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using MongoDB.Bson;
using main.Models;

namespace main.Domains;

public class ContentLikeService
{
    private readonly ILogger<ContentLikeService> _logger;
    private readonly IMongoCollection<Models.ContentLike> _contentLikeCollection;
    private readonly IMongoCollection<Models.Content> _contentCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly SearchContentService _searchContentService;

    public ContentLikeService(
       ILogger<ContentLikeService> logger,
       DatabaseSettings databaseConfig,
       IOptions<AppConstants> appConstants,
       CacheProvider cacheProvider,
       CollectionService collectionService,
       SearchContentService searchContentService
   )
    {
        _logger = logger;
        _contentLikeCollection = databaseConfig.Database.GetCollection<Models.ContentLike>(appConstants.Value.ContentLikeCollection);
        // _collectionCollection = databaseConfig.Database.GetCollection<Models.Collection>(appConstants.Value.CollectionCollection);
        _contentCollection = databaseConfig.Database.GetCollection<Models.Content>(appConstants.Value.ContentCollection);
        _cacheProvider = cacheProvider;
        _searchContentService = searchContentService;

        logger.LogDebug("Content Like service initialized");
    }

    public async Task<Models.ContentLike> Create(ContentLikeInput input)
    {
        // confirm that content exists
        await _searchContentService.GetContentById(input.ContentId);

        var contentLike = new Models.ContentLike
        {
            ContentId = input.ContentId,
            UserId = input.UserId,
        };

        await _contentLikeCollection.InsertOneAsync(contentLike);

        var filter = Builders<Models.Content>.Filter.Eq(r => r.Id, input.ContentId);
        var updates = Builders<Models.Content>.Update
            .Inc(r => r.Likes, 1);

        await _contentCollection.UpdateOneAsync(filter, updates);

        return contentLike;
    }


    public async Task<bool> Delete(ContentLikeInput input)
    {
        var filter = Builders<ContentLike>.Filter.Eq(r => r.ContentId, input.ContentId) & Builders<Models.ContentLike>.Filter.Eq(r => r.UserId, input.UserId);

        var contentAffected = await _contentLikeCollection.FindOneAndDeleteAsync(filter);

        if (contentAffected is not null)
        {
            var contentFilter = Builders<Models.Content>.Filter.Eq(r => r.Id, input.ContentId);
            var updates = Builders<Models.Content>.Update
                .Inc(r => r.Likes, -1);

            await _contentCollection.UpdateOneAsync(contentFilter, updates);
        }

        return true;
    }

    public async Task<Models.ContentLike> GetContentLike(ContentLikeInput input)
    {
        var filter = Builders<ContentLike>.Filter.Eq(r => r.ContentId, input.ContentId) & Builders<Models.ContentLike>.Filter.Eq(r => r.UserId, input.UserId);

        return await _contentLikeCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<List<Models.ContentLike>> GetContentLikes(FilterQuery<Models.ContentLike> queryFilter, string contentId)
    {
        var filter = Builders<ContentLike>.Filter.Eq(r => r.ContentId, contentId);

        return await _contentLikeCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();
    }

    public async Task<long> CountContentLikes(string contentId)
    {
        var filter = Builders<ContentLike>.Filter.Eq(r => r.ContentId, contentId);

        return await _contentLikeCollection.CountDocumentsAsync(filter);
    }

    public async Task<List<Models.ContentLike>> GetUserContentLikes(FilterQuery<Models.ContentLike> queryFilter, string userId)
    {
        var filter = Builders<ContentLike>.Filter.Eq(r => r.UserId, userId);

        return await _contentLikeCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();
    }

    public async Task<long> CountUserContentLikes(string userId)
    {
        var filter = Builders<ContentLike>.Filter.Eq(r => r.UserId, userId);

        return await _contentLikeCollection.CountDocumentsAsync(filter);
    }

}