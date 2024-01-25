using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;
using main.DTOs;

namespace main.Domains;

public class SaveTags
{
    private readonly ILogger<SaveTags> _logger;
    private readonly IMongoCollection<Models.Tag> _tagsCollection;
    private readonly SearchTag _searchTagService;

    public SaveTags(ILogger<SaveTags> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants, SearchTag searchTagService)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _tagsCollection = database.GetCollection<Models.Tag>(appConstants.Value.TagCollection);

        _searchTagService = searchTagService;

        _logger.LogDebug("SaveTagsService initialized");
    }

    public Models.Tag Create(CreateTagInput tag)
    {
        var tagToSave = new Models.Tag
        {
            Name = tag.Name,
            Description = tag.Description
        };
        _tagsCollection.InsertOne(tagToSave);

        return tagToSave;
    }

    public List<Models.Tag> ResolveTags(string[] inputTags)
    {
        var tags = new List<Models.Tag>();

        inputTags.ToList().ForEach(tag =>
        {
            var existingTag = _searchTagService.GetByName(tag);
            if (existingTag == null)
            {
                var newTag = Create(new CreateTagInput { Name = tag });
                tags.Add(newTag);
            }
            else
            {
                tags.Add(existingTag);
            }
        });

        return tags;
    }
}