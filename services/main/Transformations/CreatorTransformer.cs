

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorTransformer
{
    private readonly CreatorService _creatorService;

    public CreatorTransformer(CreatorService creatorService)
    {
        _creatorService = creatorService;
    }

    public OutputCreator Transform(Creator creator)
    {

        return new OutputCreator
        {
            Id = creator.Id,
            UserId = creator.UserId,
            Username = creator.Username,
            PricingPackage = creator.PricingPackage,
            Status = creator.Status,
            CreatorApplicationId = creator.CreatorApplicationId,
            SocialMedia = creator.SocialMedia,
            CreatedAt = creator.CreatedAt,
            UpdatedAt = creator.UpdatedAt,
        };
    }
}