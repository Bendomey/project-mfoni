

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

        OutputCreatorPackage? transformedPackage = null;
        var _package = _creatorService.GetCreatorPackageByCreatorId(creator.Id);
        if (_package is not null)
        {
            transformedPackage = new CreatorPackageTransformer().Transform(_package);
        }

        return new OutputCreator
        {
            Id = creator.Id,
            UserId = creator.UserId,
            Username = creator.Username,
            Status = creator.Status,
            CreatorApplicationId = creator.CreatorApplicationId,
            Commission = creator.Commission,
            BookCommission = creator.BookCommission,
            SocialMedia = creator.SocialMedia,
            CreatorPackage = transformedPackage,
            CreatedAt = creator.CreatedAt,
            UpdatedAt = creator.UpdatedAt,
        };
    }
}