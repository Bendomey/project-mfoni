

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class ContentTransformer
{
    private readonly SearchContentService _searchContentService;
    private readonly UserService _userService;
    private readonly SearchTagService _searchTagService;
    private readonly UserTransformer _userTransformer;
    private readonly TagTransformer _tagTransformer;
    private readonly AdminService _adminService;
    private readonly AdminTransformer _adminTransformer;
    public ContentTransformer(
        UserService userService,
        AdminService adminService,
        AdminTransformer adminTransformer,
        UserTransformer userTransformer,
        SearchTagService searchTagService,
        TagTransformer tagTransformer,
        SearchContentService searchContentService
    )
    {
        _userService = userService;
        _adminService = adminService;
        _adminTransformer = adminTransformer;
        _userTransformer = userTransformer;
        _searchTagService = searchTagService;
        _tagTransformer = tagTransformer;
        _searchContentService = searchContentService;
    }

    public async Task<OutputContent> Transform(Content content, string[]? populate = null, string? userId = null)
    {

        populate ??= Array.Empty<string>();

        OutputBasicCreator? outputBasicCreator = null;
        if (content.CreatedById is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT_CREATED_BY)))
        {
            var createdBy = await _userService.GetUserById(content.CreatedById);
            if (createdBy is not null)
            {
                outputBasicCreator = await _userTransformer.TransformBasicCreator(createdBy);
            }
        }

        var outputTags = new List<OutputTag>();
        var tags = await _searchTagService.GetTagsForContent(content.Id);

        foreach (var tag in tags)
        {
            var outputTag = await _tagTransformer.Transform(tag);
            outputTags.Add(outputTag);
        }

        string media = content.Media.Location;

        //  always show the low quality version. we want to boost the speed of the app.
        // Users will be able to download best quality when they request for it!
        if (content.BlurredMedia is not null)
        {
            media = content.BlurredMedia.Location;
        }

        OutputContentLike? outputContentLike = null;
        if (userId is not null)
        {
            var contentLike = await _searchContentService.GetContentLike(content.Id, userId);
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
            Title = content.Title,
            Slug = content.Slug,
            Type = content.Type,
            Status = content.Status,
            Tags = outputTags,
            Media = media,
            MediaOrientation = content.Media.Orientation,
            Amount = content.Amount,
            Views = content.Views,
            Likes = content.Likes,
            CurrentUserLike = outputContentLike,
            Downloads = content.Downloads,
            DoneAt = content.DoneAt,
            CreatedById = content.CreatedById!,
            CreatedBy = outputBasicCreator,
            RejectedAt = content.RejectedAt,
            CreatedAt = content.CreatedAt,
            UpdatedAt = content.UpdatedAt,
        };
    }
}