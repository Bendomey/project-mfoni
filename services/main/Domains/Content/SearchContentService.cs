using main.Models;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Amazon.Rekognition;
using Amazon.Rekognition.Model;
using MongoDB.Bson;
using Amazon.Runtime;
using main.Lib;

namespace main.Domains;

public class SearchContentService
{
    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IMongoCollection<Collection> _collectionsCollection;
    private readonly SearchTagService _searchTagsService;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly AmazonRekognitionClient _rekognitionClient;
    private readonly IMongoCollection<ContentLike> _contentLikesCollection;
    private readonly CacheProvider _cacheProvider;

    public SearchContentService(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants, SearchTagService searchTagService,
        CacheProvider cacheProvider
    )
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _collectionsCollection = database.GetCollection<Collection>(appConstants.Value.CollectionCollection);
        _contentLikesCollection = database.GetCollection<ContentLike>(appConstants.Value.ContentLikeCollection);

        _appConstantsConfiguration = appConstants.Value;

        var credentials = new BasicAWSCredentials(_appConstantsConfiguration.AWSAccessKey, _appConstantsConfiguration.AWSSecretKey);
        var region = Amazon.RegionEndpoint.USEast1;

        _rekognitionClient = new AmazonRekognitionClient(credentials, region);

        _searchTagsService = searchTagService;
        _cacheProvider = cacheProvider;

        _logger.LogDebug("SearchContentService initialized");
    }

    private FilterDefinition<Content> filterLogicForVisualSearch(
        string[] matches,
        GetContentsInput input
    )
    {
        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Empty;

        var validIds = matches.Where(match => ObjectId.TryParse(match, out _)).ToList();

        if (validIds.Count > 0)
        {
            var idFilter = Builders<Content>.Filter.Or(
                validIds.ConvertAll(id => Builders<Content>.Filter.Eq(r => r.Id, id))
            );
            filter = idFilter;
        }


        if (filter == builder.Empty)
        {
            return filter;
        }

        if (input.Orientation != "ALL")
        {
            var orientationFilter = builder.Eq(r => r.Media.Orientation, input.Orientation);
            filter &= orientationFilter;
        }

        if (input.License != "ALL")
        {
            if (input.License == "FREE")
            {
                var licenseFilter = builder.Eq(r => r.Amount, 0);
                filter &= licenseFilter;
            }
            else if (input.License == "PREMIUM")
            {
                var licenseFilter = builder.Gt(r => r.Amount, 0);
                filter &= licenseFilter;
            }
        }

        return filter;
    }

    public async Task<List<Content>> VisualSearch(
        FilterQuery<Content> queryFilter,
        string[] matches,
        GetContentsInput input
    )
    {
        var filter = filterLogicForVisualSearch(matches, input);

        var contents = await _contentsCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return contents;
    }

    public async Task<long> VisualSearchCount(
       string[] matches,
       GetContentsInput input
   )
    {
        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;

        var filter = filterLogicForVisualSearch(matches, input);
        if (filter == builder.Empty)
        {
            return 0;
        }


        var contentsCount = await _contentsCollection
            .CountDocumentsAsync(filter);

        return contentsCount;
    }

    public async Task<string[]> AskRekognitionForMatch(string s3ImageIdentifier)
    {
        var request = new SearchFacesByImageRequest
        {
            CollectionId = _appConstantsConfiguration.AWSRekognitionCollection,
            Image = new Image
            {
                S3Object = new S3Object
                {
                    Bucket = _appConstantsConfiguration.BucketName,
                    Name = s3ImageIdentifier,
                }
            },
            FaceMatchThreshold = 70F,
        };

        try
        {
            var response = await _rekognitionClient.SearchFacesByImageAsync(request);
            var matches = response.FaceMatches.Select(face => face.Face.ExternalImageId).ToArray();
            return matches;
        }
        catch (Exception e)
        {
            _logger.LogError("AskRekognitionForMatch Error: " + e.Message);
            throw new HttpRequestException("CouldNotSearchFacesByImage");
        }
    }

    public async Task<List<Content>> TextualSearch(
        List<string> contentIds
    )
    {
        var contentIdsObject = contentIds.Select(id => ObjectId.Parse(id)).ToList();
        var filter = Builders<Content>.Filter.In("_id", contentIdsObject);

        var contents = await _contentsCollection
            .Find(filter)
            .ToListAsync();

        return contents;
    }

    public async Task<long> TextualSearchCount(
        List<string> contentIds
    )
    {
        var contentIdsObject = contentIds.Select(id => ObjectId.Parse(id)).ToList();
        var filter = Builders<Content>.Filter.In("_id", contentIdsObject);

        var contents = await _contentsCollection.CountDocumentsAsync(filter);

        return contents;
    }

    public async Task<List<Content>> GetContents(
        FilterQuery<Content> queryFilter,
        GetContentsInput input
    )
    {
        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Eq(r => r.Visibility, "PUBLIC");
        filter &= builder.Eq(r => r.Status, "DONE");

        if (input.Orientation != "ALL")
        {
            var orientationFilter = builder.Eq(r => r.Media.Orientation, input.Orientation);
            filter &= orientationFilter;
        }

        if (input.License != "ALL")
        {
            if (input.License == "FREE")
            {
                var licenseFilter = builder.Eq(r => r.Amount, 0);
                filter &= licenseFilter;
            }
            else if (input.License == "PREMIUM")
            {
                var licenseFilter = builder.Gt(r => r.Amount, 0);
                filter &= licenseFilter;
            }
        }

        if (input.IsFeatured)
        {
            filter &= builder.Eq(r => r.IsFeatured, true);
        }

        var contents = await _contentsCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return contents;
    }

    public async Task<long> GetContentsCount(
        GetContentsInput input
    )
    {
        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Eq(r => r.Visibility, "PUBLIC");
        filter &= builder.Eq(r => r.Status, "DONE");

        if (input.Orientation != "ALL")
        {
            var orientationFilter = builder.Eq(r => r.Media.Orientation, input.Orientation);
            filter &= orientationFilter;
        }

        if (input.License != "ALL")
        {
            if (input.License == "FREE")
            {
                var licenseFilter = builder.Eq(r => r.Amount, 0);
                filter &= licenseFilter;
            }
            else if (input.License == "PREMIUM")
            {
                var licenseFilter = builder.Gt(r => r.Amount, 0);
                filter &= licenseFilter;
            }
        }

        if (input.IsFeatured)
        {
            filter &= builder.Eq(r => r.IsFeatured, true);
        }

        var contents = await _contentsCollection.CountDocumentsAsync(filter);

        return contents;
    }

    public async Task<Models.Content> GetContentById(string contentId)
    {
        var content = await _contentsCollection.Find(c => c.Id == contentId).FirstOrDefaultAsync();
        if (content is null)
        {
            throw new HttpRequestException("ContentNotFound");
        }

        return content;
    }

    public async Task<Models.Content> GetContentBySlug(string slug)
    {
        var content = await _contentsCollection.Find(c => c.Slug == slug).FirstOrDefaultAsync();
        if (content is null)
        {
            throw new HttpRequestException("ContentNotFound");
        }

        return content;
    }

    public async Task<List<Models.Content>> GetRelatedContents(FilterQuery<Content> queryFilter, string contentId, List<string> tagIds)
    {
        var pipeline = new[]
        {
            new BsonDocument("$match", new BsonDocument
            {
                { "visibility", "PUBLIC" },
                { "_id", new BsonDocument("$ne", ObjectId.Parse(contentId)) }
            }),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "tag_contents" },
                { "localField", "_id" },
                { "foreignField", "content_id" },
                { "as", "tag_contents" }
            }),
            new BsonDocument("$match",  new BsonDocument
            {
                { "tag_contents.tag_id",new BsonDocument("$in", new BsonArray(tagIds.Select(t => ObjectId.Parse(t)))) },
            }),
            new BsonDocument("$project", new BsonDocument("tag_contents", 0)),
            new BsonDocument("$limit", queryFilter.Limit),
            new BsonDocument("$skip", queryFilter.Skip),
            new BsonDocument("$sort", new BsonDocument("created_at", -1))
        };

        return await _contentsCollection
           .Aggregate<Models.Content>(pipeline)
           .ToListAsync();
    }

    public async Task<long> GetRelatedContentsCount(string contentId, List<string> tagIds)
    {
        var pipeline = new[]
        {
             new BsonDocument("$match", new BsonDocument
            {
                { "visibility", "PUBLIC" },
                { "_id", new BsonDocument("$ne", ObjectId.Parse(contentId)) }
            }),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "tag_contents" },
                { "localField", "_id" },
                { "foreignField", "content_id" },
                { "as", "tag_contents" }
            }),
            new BsonDocument("$match",  new BsonDocument
            {
                { "tag_contents.tag_id",new BsonDocument("$in", new BsonArray(tagIds.Select(t => ObjectId.Parse(t)))) },
            }),
            new BsonDocument("$project", new BsonDocument("tag_contents", 0)),
            new BsonDocument("$count", "totalCount")
        };

        var result = await _contentsCollection.AggregateAsync<MongoAggregationGetCount>(pipeline);

        var count = 0;
        await result.ForEachAsync(doc =>
        {
            count = doc.TotalCount;
        });

        return count;
    }

}