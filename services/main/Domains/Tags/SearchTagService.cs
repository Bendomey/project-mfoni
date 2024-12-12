using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;
using main.Lib;
using main.Models;

namespace main.Domains;

public class SearchTagService
{
    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Models.Tag> _tagsCollection;
    private readonly IMongoCollection<Models.Content> _contentCollection;
    private readonly IMongoCollection<Models.TagContent> _contentTagsCollection;

    public SearchTagService(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _tagsCollection = database.GetCollection<Models.Tag>(appConstants.Value.TagCollection);
        _contentTagsCollection = database.GetCollection<Models.TagContent>(appConstants.Value.TagContentCollection);
        _contentCollection = database.GetCollection<Models.Content>(appConstants.Value.ContentCollection);

        _logger.LogDebug("SearchTagService initialized");
    }

    public async Task<Models.Tag?> Get(string id)
    {
        var tag = await _tagsCollection.Find(tag => tag.Id == id).FirstOrDefaultAsync();
        return tag;
    }

    public Models.Tag? GetBySlug(string slug)
    {
        var tag = _tagsCollection.Find(tag => tag.Slug == slug).FirstOrDefault();
        if (tag is null)
        {
            throw new Exception("TagNotFound");
        }

        return tag;
    }

    public Models.Tag? GetByName(string name)
    {
        var tag = _tagsCollection.Find(tag => tag.Name.ToLower() == name.ToLower()).FirstOrDefault();
        return tag;
    }

    public async Task<List<Models.Tag>> GetAll(FilterQuery<Models.Tag> queryFilter, string? query)
    {
        FilterDefinitionBuilder<Models.Tag> builder = Builders<Models.Tag>.Filter;
        var filter = Builders<Models.Tag>.Filter.Empty;

        if (query != null)
        {
            filter = builder.Regex("name", new BsonRegularExpression(query, "i"));
        }

        var tags = await _tagsCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return tags ?? [];
    }

    public async Task<long> Count(string? query)
    {
        FilterDefinitionBuilder<Models.Tag> builder = Builders<Models.Tag>.Filter;
        var filter = builder.Empty;
        if (query != null)
        {
            filter = builder.Regex("name", new BsonRegularExpression(query, "i"));
        }

        var tagsCount = await _tagsCollection.CountDocumentsAsync(filter);

        return tagsCount;
    }

    public async Task<List<Models.Tag>> GetTagsBasedOnQuery(string query)
    {
        // To exhaust all search cases, we'll split the query into individual tags 
        // and then search for each of them
        var tagsForSearch = query.Split(" ");
        if (tagsForSearch.Length > 1)
        {
            tagsForSearch = tagsForSearch.Prepend(query).ToArray();
        }

        FilterDefinitionBuilder<Models.Tag> builder = Builders<Models.Tag>.Filter;
        var filter = builder.Empty;

        tagsForSearch.ToList().ForEach(tag =>
        {
            filter = builder.Regex("name", new BsonRegularExpression(tag, "i"));
        });

        var tags = await _tagsCollection.Find(filter).Skip(0).Limit(10).ToListAsync();
        return tags ?? [];
    }

    public async Task<List<Models.Tag>> GetTagsForContent(string contentId)
    {
        FilterDefinitionBuilder<Models.Tag> builder = Builders<Models.Tag>.Filter;
        var filter = Builders<Models.TagContent>.Filter.Eq("content_id", ObjectId.Parse(contentId));


        var contentTags = await _contentTagsCollection
            .Find(filter)
            .ToListAsync();

        var tags = new List<Models.Tag>();

        contentTags.ForEach(contentTag =>
        {
            var tag = _tagsCollection.Find(tag => tag.Id == contentTag.TagId).FirstOrDefault();
            if (tag != null)
            {
                tags.Add(tag);
            }
        });

        return tags;
    }

    public async Task<List<Models.TagContent>> GetTagContents(
           FilterQuery<Models.TagContent> queryFilter,
           GetContentsForTagInput input
       )
    {
        var pipeline = new[]
        {
            new BsonDocument("$match",  new BsonDocument
            {
                { "tag_id",new BsonDocument("$eq", new ObjectId(input.TagId)) },
            }),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "contents" },
                { "localField", "content_id" },
                { "foreignField", "_id" },
                { "as", "contents" }
            }),
            new BsonDocument("$unwind", "$contents"),

            new BsonDocument("$match",  new BsonDocument
            {
                { "contents.visibility",new BsonDocument("$eq", ContentVisibility.PUBLIC) },
            }),
        };

        if (input.Orientation != "ALL")
        {
            pipeline = pipeline.Append(new BsonDocument("$match", new BsonDocument
            {
                { "contents.orientation",  new BsonDocument("$eq", input.Orientation) }
            })).ToArray();
        }

        if (input.License != "ALL")
        {
            var licenseDoc = new BsonDocument("$eq", 0);

            if (input.License == "PREMIUM")
            {
                licenseDoc = new BsonDocument("$gt", 0);
            }

            pipeline = pipeline.Append(new BsonDocument("$match", new BsonDocument
            {
                { "contents.amount",  licenseDoc }
            })).ToArray();
        }

        pipeline = pipeline.Append(new BsonDocument("$project", new BsonDocument("contents", 0))).ToArray();
        pipeline = pipeline.Append(new BsonDocument("$limit", queryFilter.Limit)).ToArray();
        pipeline = pipeline.Append(new BsonDocument("$skip", queryFilter.Skip)).ToArray();

        // TODO: figure out how to sort dynamically
        pipeline = pipeline.Append(new BsonDocument("$sort", new BsonDocument("created_at", -1))).ToArray();

        return await _contentTagsCollection
           .Aggregate<Models.TagContent>(pipeline)
           .ToListAsync();
    }

    public async Task<long> CountTagContents(GetContentsForTagInput input)
    {
        var pipeline = new[]
        {
             new BsonDocument("$match",  new BsonDocument
            {
                { "tag_id",new BsonDocument("$eq", new ObjectId(input.TagId)) },
            }),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "contents" },
                { "localField", "content_id" },
                { "foreignField", "_id" },
                { "as", "contents" }
            }),
            new BsonDocument("$unwind", "$contents"),

            new BsonDocument("$match",  new BsonDocument
            {
                { "contents.visibility",new BsonDocument("$eq", ContentVisibility.PUBLIC) },
            }),
        };

        if (input.Orientation != "ALL")
        {
            pipeline = pipeline.Append(new BsonDocument("$match", new BsonDocument
            {
                { "contents.orientation",  new BsonDocument("$eq", input.Orientation) }
            })).ToArray();
        }

        if (input.License != "ALL")
        {
            var licenseDoc = new BsonDocument("$eq", 0);

            if (input.License == "PREMIUM")
            {
                licenseDoc = new BsonDocument("$gt", 0);
            }

            pipeline = pipeline.Append(new BsonDocument("$match", new BsonDocument
            {
                { "contents.amount",  licenseDoc }
            })).ToArray();
        }

        pipeline = pipeline.Append(new BsonDocument("$count", "totalCount")).ToArray();

        var result = await _contentTagsCollection.AggregateAsync<MongoAggregationGetCount>(pipeline);

        var count = 0;
        await result.ForEachAsync(doc =>
        {
            count = doc.TotalCount;
        });

        return count;
    }
}