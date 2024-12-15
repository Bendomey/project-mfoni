

using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class TagTransformer
{
    private readonly UserService _userService;
    private readonly UserTransformer _userTransformer;
    private readonly AdminService _adminService;
    private readonly AdminTransformer _adminTransformer;
    private readonly CacheProvider _cacheProvider;
    public TagTransformer(
        UserService userService,
        AdminService adminService,
        AdminTransformer adminTransformer,
        UserTransformer userTransformer,
        CacheProvider cacheProvider
    )
    {
        _userService = userService;
        _adminService = adminService;
        _adminTransformer = adminTransformer;
        _userTransformer = userTransformer;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputTag> Transform(Tag tag, string[]? populate = null)
    {

        populate ??= Array.Empty<string>();

        OutputAdmin? outputCreatedByAdmin = null;
        if (tag.CreatedByAdminId is not null && populate.Any(p => p.Contains(PopulateKeys.TAG_CREATED_BY_ADMIN)))
        {
            var createdBy = _adminService.GetAdminById(tag.CreatedByAdminId);
            if (createdBy is not null)
            {
                outputCreatedByAdmin = _adminTransformer.Transform(createdBy, populate);
            }
        }

        OutputBasicUser? outputCreatedByUser = null;
        if (tag.CreatedByUserId is not null && populate.Any(p => p.Contains(PopulateKeys.TAG_CREATED_BY_USER)))
        {
            var createdBy = await _cacheProvider.ResolveCache($"users.{tag.CreatedByUserId}", () => _userService.GetUserById(tag.CreatedByUserId));
            if (createdBy is not null)
            {
                outputCreatedByUser = _userTransformer.TransformBasicUser(createdBy);
            }
        }

        return new OutputTag
        {
            Id = tag.Id,
            Name = tag.Name,
            Slug = tag.Slug,
            Description = tag.Description,
            CreatedByAdminId = tag.CreatedByAdminId,
            CreatedByAdmin = outputCreatedByAdmin,
            CreatedByUserId = tag.CreatedByUserId,
            CreatedByUser = outputCreatedByUser,
            CreatedAt = tag.CreatedAt,
            UpdatedAt = tag.UpdatedAt,
        };
    }
}