using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.DTOs;
using NanoidDotNet;
using main.Models;

namespace main.Domains;

public class SaveTagsService
{
    private readonly ILogger<SaveTagsService> _logger;
    private readonly IMongoCollection<Models.Tag> _tagsCollection;
    private readonly SearchTagService _searchTagService;
    private readonly CollectionContentService _collectionContentService;
    private readonly CollectionService _collectionService;
    private readonly CacheProvider _cacheProvider;

    public SaveTagsService(ILogger<SaveTagsService> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants, SearchTagService searchTagService,
        CacheProvider cacheProvider,
        CollectionContentService collectionContentService,
        CollectionService collectionService
    )
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _tagsCollection = database.GetCollection<Models.Tag>(appConstants.Value.TagCollection);

        _searchTagService = searchTagService;
        _collectionContentService = collectionContentService;
        _collectionService = collectionService;

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

    public async Task<CollectionContent> FeatureTag(string tagId)
    {
        var tag = await _searchTagService.Get(tagId);
        if (tag is null)
        {
            throw new HttpRequestException("TagNotFound");
        }

        if (tag.IsFeatured)
        {
            throw new HttpRequestException("TagAlreadyFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_tags");

        var newCollectionContent = _collectionContentService.SaveCollectionContent(new SaveCollectionContent
        {
            CollectionId = featuredCollection.Id,
            Type = "TAG",
            TagId = tag.Id,
        });

        var update = Builders<Models.Tag>.Update
            .Set("is_featured", true)
            .Set("updated_at", DateTime.UtcNow);
        await _tagsCollection.UpdateOneAsync(tag => tag.Id == tagId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["tags"]}.find*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Slug}*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Id}*",
        });

        return newCollectionContent;
    }

    public async Task<bool> UnFeatureTag(string tagId)
    {
        var tag = await _searchTagService.Get(tagId);
        if (tag is null)
        {
            throw new HttpRequestException("TagNotFound");
        }

        if (!tag.IsFeatured)
        {
            throw new HttpRequestException("TagNotFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_tags");

        _collectionContentService.RemoveContentsFromCollection(new RemoveContentsFromCollectionInput
        {
            ContentIds = [tagId],
            Id = featuredCollection.Id,
            Type = "TAG",
        });

        var update = Builders<Models.Tag>.Update
            .Set("is_featured", false)
            .Set("updated_at", DateTime.UtcNow);
        await _tagsCollection.UpdateOneAsync(tag => tag.Id == tagId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["tags"]}.find*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Slug}*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Id}*",
        });

        return true;
    }
}