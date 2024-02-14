using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;

namespace main.Domains;

public class SearchTag
{
    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Models.Tag> _tagsCollection;

    public SearchTag(ILogger<IndexContent> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _tagsCollection = database.GetCollection<Models.Tag>(appConstants.Value.TagCollection);

        _logger.LogDebug("SearchTagService initialized");
    }

    public async Task<Models.Tag?> Get(string id)
    {
        var tag = await _tagsCollection.Find(tag => tag.Id == id).FirstOrDefaultAsync();
        return tag;
    }

    public Models.Tag? GetByName(string name)
    {
        var tag = _tagsCollection.Find(tag => tag.Name.ToLower() == name.ToLower()).FirstOrDefault();
        return tag;
    }

    public async Task<List<Models.Tag>> GetAll(string? searchTag = null)
    {
        if (searchTag is not null)
        {
            var filter = Builders<Models.Tag>.Filter
                .Or(Builders<Models.Tag>.Filter.Eq(t => t.Name, searchTag),
                Builders<Models.Tag>.Filter.Eq(t => t.Description, searchTag));

            var result = _tagsCollection.Find(filter).ToList();
            return result;
        }

        var tags = await _tagsCollection.Find(tag => true).Skip(0).Limit(50).ToListAsync();
        return tags ?? []; 
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
            var nameFilter = builder.Regex("name", new BsonRegularExpression(tag, "i"));
            // @FIXME: filter not working. Find out why
            filter |= nameFilter;
        });

        var tags = await _tagsCollection.Find(filter).Skip(0).Limit(10).ToListAsync();
        return tags ?? [];
    }
}