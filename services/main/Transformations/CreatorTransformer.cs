

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorTransformer
{
    public CreatorTransformer()
    {
    }

    public OutputCreator Transform(Creator creator)
    {
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
            CreatedAt = creator.CreatedAt,
            UpdatedAt = creator.UpdatedAt,
        };
    }
}