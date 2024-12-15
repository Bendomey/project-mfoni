using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class TagContentTransformer
{
    private readonly SearchContentService _contentService;
    private readonly SearchTagService _tagService;
    private readonly TagTransformer _tagTransformer;
    private readonly ContentTransformer _contentTransformer;
    private readonly CacheProvider _cacheProvider;

    public TagContentTransformer(
       SearchTagService tagService,
       SearchContentService contentService,
       ContentTransformer contentTransformer,
       TagTransformer tagTransformer,
        CacheProvider cacheProvider
    )
    {
        _contentService = contentService;
        _contentTransformer = contentTransformer;
        _tagService = tagService;
        _tagTransformer = tagTransformer;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputTagContent> Transform(TagContent tagContent, string[]? populate = null, string? userId = null)
    {
        populate ??= Array.Empty<string>();

        OutputTag? outputTag = null;
        if (tagContent.TagId is not null && populate.Any(p => p.Contains(PopulateKeys.TAG)))
        {
            var tag = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["tags"]}.{tagContent.TagId}", () => _tagService.Get(tagContent.TagId));
            if (tag is not null)
            {
                outputTag = await _tagTransformer.Transform(tag);
            }
        }

        OutputContent? outputContent = null;
        if (tagContent.ContentId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT)))
        {
            var content = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["contents"]}.{tagContent.ContentId}", () => _contentService.GetContentById(tagContent.ContentId));
            if (content is not null)
            {
                outputContent = await _contentTransformer.Transform(content, populate: populate, userId: userId);
            }
        }

        return new OutputTagContent
        {
            Id = tagContent.Id,
            TagId = tagContent.TagId,
            ContentId = tagContent.ContentId,
            CreatedAt = tagContent.CreatedAt,
            UpdatedAt = tagContent.UpdatedAt,
            Tag = outputTag,
            Content = outputContent,
        };
    }
}