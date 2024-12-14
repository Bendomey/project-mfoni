

using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class CollectionContentTransformer
{

    private readonly SearchTagService _tagService;
    private readonly TagTransformer _tagTransformer;
    private readonly CollectionContentService _collectionContentService;
    private readonly SearchContentService _contentService;
    private readonly ContentTransformer _contentTransformer;

    public CollectionContentTransformer(
       SearchTagService tagService,
       CollectionContentService collectionContentService,
        TagTransformer tagTransformer,
        SearchContentService contentService,
        ContentTransformer contentTransformer
    )
    {
        _tagService = tagService;
        _tagTransformer = tagTransformer;
        _collectionContentService = collectionContentService;
        _contentService = contentService;
        _contentTransformer = contentTransformer;
    }

    public async Task<OutputCollectionContent> Transform(CollectionContent collectionContent, string[]? populate = null, string? userId = null)
    {
        populate ??= Array.Empty<string>();

        OutputTag? outputTag = null;
        if (collectionContent.TagId is not null && populate.Any(p => p.Contains(PopulateKeys.TAG)))
        {
            var tag = await _tagService.Get(collectionContent.TagId);
            if (tag is not null)
            {
                outputTag = await _tagTransformer.Transform(tag, populate: populate);
            }
        }

        OutputContent? outputContent = null;
        if (collectionContent.ContentId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT)))
        {
            var content = await _contentService.GetContentById(collectionContent.ContentId);
            if (content is not null)
            {
                outputContent = await _contentTransformer.Transform(content, populate: populate, userId: userId);
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
            ChildCollectionId = collectionContent.ChildCollectionId,
            // ChildCollection = outputChildCollection,
            TagId = collectionContent.TagId,
            Tag = outputTag,
            CreatedAt = collectionContent.CreatedAt,
            UpdatedAt = collectionContent.UpdatedAt,
        };
    }

}