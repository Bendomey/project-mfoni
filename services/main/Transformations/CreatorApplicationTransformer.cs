using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class CreatorApplicationTransformer
{
    private readonly UserService _userService;
    private readonly UserTransformer _userTransformer;
    public CreatorApplicationTransformer(
        UserService userService,
        UserTransformer userTransformer
    )
    {
        _userService = userService;
        _userTransformer = userTransformer;
    }

    public async Task<OutputCreatorApplication> Transform(CreatorApplication creatorApplication, string[]? populate = null)
    {

        populate ??= Array.Empty<string>();

        OutputBasicUserForAdmin? outputBasicUser = null;
        if (creatorApplication.UserId is not null && populate.Any(p => p.Contains(PopulateKeys.USER)))
        {
            var createdBy = await _userService.GetUserById(creatorApplication.UserId);
            if (createdBy is not null)
            {
                outputBasicUser = _userTransformer.TransformBasicUserForAdmin(createdBy);
            }
        }

        return new OutputCreatorApplication
        {
            Id = creatorApplication.Id,
            UserId = creatorApplication.UserId!,
            User = outputBasicUser,
            Status = creatorApplication.Status,
            SubmittedAt = creatorApplication.SubmittedAt,
            RejectedAt = creatorApplication.RejectedAt,
            RejectedById = creatorApplication.RejectedById,
            ApprovedAt = creatorApplication.ApprovedAt,
            ApprovedById = creatorApplication.ApprovedById,
            IdType = creatorApplication.IdType,
            IdNumber = creatorApplication.IdNumber,
            IdFrontImage = creatorApplication.IdFrontImage,
            IdBackImage = creatorApplication.IdBackImage,
            IntendedPricingPackage = creatorApplication.IntendedPricingPackage,
            CreatedAt = creatorApplication.CreatedAt,
            UpdatedAt = creatorApplication.UpdatedAt,
        };
    }
}