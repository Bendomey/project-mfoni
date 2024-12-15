

using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Lib;
using main.Models;

namespace main.Transformations;

public class ContentLikeTransformer
{
    private readonly UserService _userService;
    private readonly SearchContentService _contentService;
    private readonly CollectionContentTransformer _collectionContentTransformer;
    private readonly UserTransformer _userTransformer;
    private readonly ContentTransformer _contentTransformer;
    private readonly CacheProvider _cacheProvider;

    public ContentLikeTransformer(
       UserService userService,
       SearchContentService contentService,
       UserTransformer userTransformer,
         CollectionContentTransformer collectionContentTransformer,
        ContentTransformer contentTransformer,
        CacheProvider cacheProvider
    )
    {
        _userService = userService;
        _userTransformer = userTransformer;
        _contentService = contentService;
        _collectionContentTransformer = collectionContentTransformer;
        _contentTransformer = contentTransformer;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputContentLike> Transform(ContentLike contentLike, string[]? populate = null, string? userId = null)
    {
        populate ??= Array.Empty<string>();

        OutputBasicUser? outputCreatedByUser = null;
        if (contentLike.UserId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT_LIKE_CREATED_BY)))
        {
            var createdBy = await _cacheProvider.ResolveCache($"users.{contentLike.UserId}", () => _userService.GetUserById(contentLike.UserId));
            if (createdBy is not null)
            {
                outputCreatedByUser = _userTransformer.TransformBasicUser(createdBy);
            }
        }

        OutputContent? outputContent = null;
        if (contentLike.ContentId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT)))
        {
            var content = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["contents"]}.{contentLike.ContentId}", () => _contentService.GetContentById(contentLike.ContentId));
            if (content is not null)
            {
                outputContent = await _contentTransformer.Transform(content, populate: populate, userId: userId);
            }
        }

        return new OutputContentLike
        {
            Id = contentLike.Id,
            ContentId = contentLike.ContentId,
            Content = outputContent,
            User = outputCreatedByUser,
            UserId = contentLike.UserId,
            CreatedAt = contentLike.CreatedAt,
            UpdatedAt = contentLike.UpdatedAt,
        };
    }

}