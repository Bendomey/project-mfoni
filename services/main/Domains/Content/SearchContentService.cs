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

    public SearchContentService(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants, SearchTagService searchTagService)
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

        _logger.LogDebug("SearchContentService initialized");
    }

    private FilterDefinition<Content> filterLogicForVisualSearch(
        string[] matches,
        GetContentsInput input
    )
    {
        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Empty;


        matches.ToList().ForEach(match =>
        {
            if (!ObjectId.TryParse(match, out _))
            {
                return;
            }

            var idFilter = builder.Eq(r => r.Id, match);
            filter |= idFilter;
        });

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
        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;

        var filter = filterLogicForVisualSearch(matches, input);
        if (filter == builder.Empty)
        {
            return [];
        }


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

    public async Task<string[]> AskRekognitionForMatch(byte[] imageBytes)
    {
        var request = new SearchFacesByImageRequest
        {
            CollectionId = _appConstantsConfiguration.AWSRekognitionCollection,
            Image = new Image
            {
                Bytes = new MemoryStream(imageBytes),
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
            _logger.LogError("Error: " + e.Message);
            // TODO: send to sentry for triaging :) 
            throw;
        }
    }

    public async Task<List<Content>> TextualSearch(
        FilterQuery<Content> queryFilter,
        string query,
        GetContentsInput input
    )
    {
        // TODO: implement search with ELASTICSEARCH

        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Empty;

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

        var contents = await _contentsCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return contents;
    }

    public async Task<long> TextualSearchCount(
        string query,
        GetContentsInput input
    )
    {
        // TODO: implement search with ELASTICSEARCH

        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Empty;

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

        var contents = await _contentsCollection.CountDocumentsAsync(filter);

        return contents;
    }

    public async Task<ContentLike?> GetContentLike(string contentId, string userId)
    {
        var filter = Builders<ContentLike>.Filter.Eq(r => r.ContentId, contentId) & Builders<ContentLike>.Filter.Eq(r => r.UserId, userId);
        var contentLike = await _contentLikesCollection.Find(filter).FirstOrDefaultAsync();
        return contentLike;
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

}