using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class CreatorApplicationTransformer
{
    private readonly UserService _userService;
    private readonly MfoniPackageService _mfoniPackageService;
    private readonly UserTransformer _userTransformer;
    private readonly MfoniPackageTransformer _mfoniPackageTransformer;
    public CreatorApplicationTransformer(
        UserService userService,
        MfoniPackageService mfoniPackageService,
        UserTransformer userTransformer,
        MfoniPackageTransformer mfoniPackageTransformer
    )
    {
        _userService = userService;
        _mfoniPackageService = mfoniPackageService;
        _userTransformer = userTransformer;
        _mfoniPackageTransformer = mfoniPackageTransformer;
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

        OutputMfoniPackage? intendedPricingPackage = null;
        if (creatorApplication.IntendedPricingPackageId is not null && populate.Any(p => p.Contains(PopulateKeys.CREATOR_APPLICATION_MFONI_PACKAGE)))
        {
            var mfoniPackage = await _mfoniPackageService.GetById(creatorApplication.IntendedPricingPackageId);
            if (mfoniPackage is not null)
            {
                intendedPricingPackage = _mfoniPackageTransformer.Transform(mfoniPackage);
            }
        }

        return new OutputCreatorApplication
        {
            Id = creatorApplication.Id,
            UserId = creatorApplication.UserId!,
            User = outputBasicUser,
            Status = creatorApplication.Status,
            SubmittedAt = creatorApplication.SubmittedAt,
            RejectedReason = creatorApplication.RejectedReason,
            RejectedAt = creatorApplication.RejectedAt,
            RejectedById = creatorApplication.RejectedById,
            ApprovedAt = creatorApplication.ApprovedAt,
            ApprovedById = creatorApplication.ApprovedById,
            IdType = creatorApplication.IdType,
            IdNumber = creatorApplication.IdNumber,
            IdFrontImage = creatorApplication.IdFrontImage,
            IdBackImage = creatorApplication.IdBackImage,
            IntendedPricingPackageId = creatorApplication.IntendedPricingPackageId,
            IntendedPricingPackage = intendedPricingPackage,
            CreatedAt = creatorApplication.CreatedAt,
            UpdatedAt = creatorApplication.UpdatedAt,
        };
    }
}