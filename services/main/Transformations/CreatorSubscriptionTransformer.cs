

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorSubscriptionTransformer
{

    public CreatorSubscriptionTransformer()
    {
    }

    public OutputCreatorSubscription Transform(CreatorSubscription creatorSubscription)
    {
        return new OutputCreatorSubscription
        {
            Id = creatorSubscription.Id,
            PackageType = creatorSubscription.PackageType,
            Period = creatorSubscription.Period,
            StartedAt = creatorSubscription.StartedAt,
            EndedAt = creatorSubscription.EndedAt,
            CreatedAt = creatorSubscription.CreatedAt,
            UpdatedAt = creatorSubscription.UpdatedAt,
        };
    }
}