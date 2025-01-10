

using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class CollectionContentTransformer
{

    private readonly SearchTagService _tagService;
    private readonly TagTransformer _tagTransformer;
    private readonly SearchContentService _contentService;
    private readonly CreatorService _creatorService;
    private readonly CreatorTransformer _creatorTransformer;
    private readonly ContentTransformer _contentTransformer;
    private readonly CacheProvider _cacheProvider;

    public CollectionContentTransformer(
       SearchTagService tagService,
        TagTransformer tagTransformer,
        SearchContentService contentService,
        CreatorService creatorService,
        ContentTransformer contentTransformer,
        CreatorTransformer creatorTransformer,
        CacheProvider cacheProvider
    )
    {
        _tagService = tagService;
        _tagTransformer = tagTransformer;
        _contentService = contentService;
        _creatorService = creatorService;
        _contentTransformer = contentTransformer;
        _creatorTransformer = creatorTransformer;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputCollectionContent> Transform(CollectionContent collectionContent, string[]? populate = null, string? userId = null)
    {
        populate ??= Array.Empty<string>();

        OutputTag? outputTag = null;
        if (collectionContent.TagId is not null && populate.Any(p => p.Contains(PopulateKeys.TAG)))
        {
            var tag = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["tags"]}.{collectionContent.TagId}", () => _tagService.Get(collectionContent.TagId));
            if (tag is not null)
            {
                outputTag = await _tagTransformer.Transform(tag, populate: populate);
            }
        }

        OutputContent? outputContent = null;
        if (collectionContent.ContentId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT)))
        {
            var content = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["contents"]}.{collectionContent.ContentId}", () => _contentService.GetContentById(collectionContent.ContentId));
            if (content is not null)
            {
                outputContent = await _contentTransformer.Transform(content, populate: populate, userId: userId);
            }
        }

        OutputCreatorEnhanced? outputCreator = null;
        if (collectionContent.CreatorId is not null && populate.Any(p => p.Contains(PopulateKeys.CREATOR)))
        {
            var creator = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["creators"]}.{collectionContent.CreatorId}", () => _creatorService.GetCreatorById(collectionContent.CreatorId));
            if (creator is not null)
            {
                outputCreator = await _creatorTransformer.TransformEnhancedCreator(creator);
            }
        }

        return new OutputCollectionContent
        {
            Id = collectionContent.Id,
            CollectionId = collectionContent.CollectionId,
            Type = collectionContent.Type,
            // Collection = outputCollection,
            ContentId = collectionContent.ContentId,
            Content = outputContent,
            CreatorId = collectionContent.CreatorId,
            Creator = outputCreator,
            ChildCollectionId = collectionContent.ChildCollectionId,
            // ChildCollection = outputChildCollection,
            TagId = collectionContent.TagId,
            Tag = outputTag,
            CreatedAt = collectionContent.CreatedAt,
            UpdatedAt = collectionContent.UpdatedAt,
        };
    }

}