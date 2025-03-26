

using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class ContentTransformer
{
    private readonly SearchContentService _searchContentService;
    private readonly ContentLikeService _contentLikeService;
    private readonly UserService _userService;
    private readonly SearchTagService _searchTagService;
    private readonly UserTransformer _userTransformer;
    private readonly PurchaseContentService _purchaseContentService;
    private readonly TagTransformer _tagTransformer;
    private readonly AdminService _adminService;
    private readonly AdminTransformer _adminTransformer;
    private readonly CacheProvider _cacheProvider;
    public ContentTransformer(
        UserService userService,
        ContentLikeService contentLikeService,
        AdminService adminService,
        AdminTransformer adminTransformer,
        UserTransformer userTransformer,
        SearchTagService searchTagService,
        TagTransformer tagTransformer,
        PurchaseContentService purchaseContentService,
        SearchContentService searchContentService,
        CacheProvider cacheProvider
    )
    {
        _userService = userService;
        _contentLikeService = contentLikeService;
        _adminService = adminService;
        _adminTransformer = adminTransformer;
        _userTransformer = userTransformer;
        _searchTagService = searchTagService;
        _tagTransformer = tagTransformer;
        _searchContentService = searchContentService;
        _purchaseContentService = purchaseContentService;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputContent> Transform(Content content, string[]? populate = null, string? userId = null)
    {
        populate ??= Array.Empty<string>();

        ContentPurchase? contentPurchase = null;
        if (userId is not null)
        {
            contentPurchase = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["contents"]}.{content.Id}.users.{userId}.purchases", () => _purchaseContentService.GetSuccessfulContentPurchaseByContentId(content.Id, userId));
        }

        OutputBasicCreator? outputBasicCreator = null;
        if (content.CreatedById is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT_CREATED_BY)))
        {
            var createdBy = await _cacheProvider.ResolveCache($"users.{content.CreatedById}", () => _userService.GetUserById(content.CreatedById));
            if (createdBy is not null)
            {
                outputBasicCreator = await _userTransformer.TransformBasicCreator(createdBy);
            }
        }

        List<OutputTag>? outputTags = null;
        var tags = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["contents"]}.{content.Id}.tags", () => _searchTagService.GetTagsForContent(content.Id));

        var tagsId = tags.Select(t => t.Id).ToList();
        if (populate.Any(p => p.Contains(PopulateKeys.CONTENT_TAGS)))
        {
            outputTags = new List<OutputTag>();
            foreach (var tag in tags)
            {
                var outputTag = await _tagTransformer.Transform(tag);
                outputTags.Add(outputTag);
            }
        }

        string media = content.Media.Location;

        if (content.Amount > 0 && content.BlurredMedia is not null && contentPurchase is null && content.CreatedById != userId)
        {
            media = content.BlurredMedia.Location;
        }
        else if (content.LargeMedia is not null)
        {
            media = content.LargeMedia.Location;
        }

        OutputContentLike? outputContentLike = null;
        if (userId is not null)
        {
            var contentLike = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["contents"]}.{content.Id}.users.{userId}.likes", () => _contentLikeService.GetContentLike(new ContentLikeInput
            {
                ContentId = content.Id,
                UserId = userId
            }));

            if (contentLike is not null)
            {
                outputContentLike = new OutputContentLike
                {
                    Id = contentLike.Id,
                    ContentId = contentLike.ContentId,
                    UserId = contentLike.UserId,
                    CreatedAt = contentLike.CreatedAt,
                    UpdatedAt = contentLike.UpdatedAt
                };
            }
        }

        return new OutputContent
        {
            Id = content.Id,
            IsFeatured = content.IsFeatured,
            Title = content.Title,
            Slug = content.Slug,
            Type = content.Type,
            Visibility = content.Visibility,
            Status = content.Status,
            TagsId = tagsId,
            Tags = outputTags,
            Meta = new OutputContentMeta
            {
                Views = content.Views,
                Downloads = content.Downloads,
                Likes = content.Likes
            },
            Media = new OutputContentMedia
            {
                Url = media,
                Orientation = content.Media.Orientation,
                BackgroundColor = content.Media.BackgroundColor,
                Sizes = new OutputContentMediaSizes
                {
                    Small = content.SmallMedia is not null ? content.SmallMedia.Size : 0,
                    Medium = content.MediumMedia is not null ? content.MediumMedia.Size : 0,
                    Large = content.LargeMedia is not null ? content.LargeMedia.Size : 0,
                    Original = content.Media.Size
                }
            },
            Amount = content.Amount,
            CurrentUserLike = outputContentLike,
            DoneAt = content.DoneAt,
            ImageProcessingResponse = new ImageProcessingOutput
            {
                Status = content.RekognitionMetaData?.Status ?? "PENDING",
                Message = content.RekognitionMetaData?.Details?.Message
            },
            IsPurchased = !string.IsNullOrEmpty(contentPurchase?.Id),
            CreatedById = content.CreatedById!,
            CreatedBy = outputBasicCreator,
            RejectedAt = content.RejectedAt,
            CreatedAt = content.CreatedAt,
            UpdatedAt = content.UpdatedAt,
        };
    }
}