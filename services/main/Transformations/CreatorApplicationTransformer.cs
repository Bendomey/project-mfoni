

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorApplicationTransformer
{
    public CreatorApplicationTransformer()
    {
    }

    public OutputCreatorApplication Transform(CreatorApplication creatorApplication)
    {
        return new OutputCreatorApplication
        {
            Id = creatorApplication.Id,
            UserId = creatorApplication.UserId,
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