using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.DTOs;
using NanoidDotNet;

namespace main.Domains;

public class SaveTagsService
{
    private readonly ILogger<SaveTagsService> _logger;
    private readonly IMongoCollection<Models.Tag> _tagsCollection;
    private readonly SearchTagService _searchTagService;
    private readonly CacheProvider _cacheProvider;

    public SaveTagsService(ILogger<SaveTagsService> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants, SearchTagService searchTagService,
        CacheProvider cacheProvider)
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _tagsCollection = database.GetCollection<Models.Tag>(appConstants.Value.TagCollection);

        _searchTagService = searchTagService;

        _cacheProvider = cacheProvider;

        _logger.LogDebug("SaveTagsService initialized");
    }

    public Models.Tag Create(CreateTagInput tag, CurrentUserOutput userInput)
    {
        var existingTag = _searchTagService.GetByName(tag.Name);
        if (existingTag != null)
        {
            return existingTag;
        }

        var tagToSave = new Models.Tag
        {
            Name = tag.Name,
            Slug = $"{tag.Name.ToLower().Replace(" ", "_")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 10)}",
            Description = tag.Description,
            CreatedByUserId = userInput.Id,
        };

        _tagsCollection.InsertOne(tagToSave);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["tags"]}.find*",
        });

        return tagToSave;
    }

    public List<Models.Tag> ResolveTags(string[] inputTags, CurrentUserOutput userInput)
    {
        var tags = new List<Models.Tag>();

        inputTags.ToList().ForEach(tag =>
        {
            var existingTag = _searchTagService.GetByName(tag);
            if (existingTag == null)
            {
                var newTag = Create(new CreateTagInput { Name = tag }, userInput);
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