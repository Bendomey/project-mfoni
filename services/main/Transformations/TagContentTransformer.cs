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

    public TagContentTransformer(
       SearchTagService tagService,
       SearchContentService contentService,
       ContentTransformer contentTransformer,
       TagTransformer tagTransformer
    )
    {
        _contentService = contentService;
        _contentTransformer = contentTransformer;
        _tagService = tagService;
        _tagTransformer = tagTransformer;
    }

    public async Task<OutputTagContent> Transform(TagContent tagContent, string[]? populate = null)
    {
        populate ??= Array.Empty<string>();

        OutputTag? outputTag = null;
        if (tagContent.TagId is not null && populate.Any(p => p.Contains(PopulateKeys.TAG)))
        {
            var tag = await _tagService.Get(tagContent.TagId);
            if (tag is not null)
            {
                outputTag = await _tagTransformer.Transform(tag);
            }
        }

        OutputContent? outputContent = null;
        if (tagContent.ContentId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT)))
        {
            var content = await _contentService.GetContentById(tagContent.ContentId);
            if (content is not null)
            {
                outputContent = await _contentTransformer.Transform(content, populate: populate);
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