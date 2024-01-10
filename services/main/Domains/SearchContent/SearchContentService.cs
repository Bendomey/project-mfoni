using main.Models;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Amazon.Rekognition;
using Amazon.Rekognition.Model;
using MongoDB.Bson;
using Amazon.Runtime;

namespace main.Domains;

public class SearchContent
{
    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IMongoCollection<Collection> _collectionsCollection;
    private readonly SearchTag _searchTagsService;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly AmazonRekognitionClient _rekognitionClient;

    public SearchContent(ILogger<IndexContent> logger, IOptions<DatabaseSettings> mfoniStoreDatabaseSettings, IOptions<AppConstants> appConstants, SearchTag searchTagService)
    {
        _logger = logger;

        var database = connectToDatabase(mfoniStoreDatabaseSettings);

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _collectionsCollection = database.GetCollection<Collection>(appConstants.Value.CollectionCollection);

        _appConstantsConfiguration = appConstants.Value;

        var credentials = new BasicAWSCredentials(_appConstantsConfiguration.AWSAccessKey, _appConstantsConfiguration.AWSSecretKey);
        var region = Amazon.RegionEndpoint.USEast1;
        
        _rekognitionClient = new AmazonRekognitionClient(credentials, region);

        _searchTagsService = searchTagService;

        _logger.LogDebug("SearchContentService initialized");
    }

    private IMongoDatabase connectToDatabase(IOptions<DatabaseSettings> mfoniStoreDatabaseSettings)
    {
        var client = new MongoClient(mfoniStoreDatabaseSettings.Value.ConnectionString);
        return client.GetDatabase(mfoniStoreDatabaseSettings.Value.DatabaseName);
    }

    public async Task<List<Content>> VisualSearch(byte[] imageBytes)
    {
        var matches = await AskRekognitionForMatch(imageBytes);
        if (matches == null)
        {
            return [];
        }

        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Empty;

        matches.ToList().ForEach(match =>
        {
            if(!ObjectId.TryParse(match, out _))
            {
                return;
            }

            var idFilter = builder.Eq(r => r.Id, match);
            filter |= idFilter;
        });

        if (filter == builder.Empty)
        {
            return [];
        }

        // TODO: implement pagination
        var contents = await _contentsCollection.Find(filter).Skip(0).Limit(10).ToListAsync();
        return contents;
    }

    private async Task<string[]> AskRekognitionForMatch(byte[] imageBytes)
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

    public async Task<List<Content>> TextualSearch(string query)
    {
        var tags = await _searchTagsService.GetTagsBasedOnQuery(query);
        if(tags.Count == 0)
        {
            return [];
        }

        FilterDefinitionBuilder<Content> builder = Builders<Content>.Filter;
        var filter = builder.Empty;

        tags.ToList().ForEach(tag =>
        {
            // check if id is in tags
            var idFilter = builder.AnyIn("tags", tag.Id);
            filter |= idFilter;
        });
        
        // TODO: implement pagination
        var contents = await _contentsCollection.Find(filter).Skip(0).Limit(10).ToListAsync();
        return contents;
    }

}