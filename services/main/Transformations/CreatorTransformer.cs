

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorTransformer
{
    private readonly SubscriptionService _subscriptionService;
    private readonly CreatorSubscriptionTransformer _creatorSubscriptionTransformer;

    public CreatorTransformer(SubscriptionService subscriptionService, CreatorSubscriptionTransformer creatorSubscriptionTransformer)
    {
        _subscriptionService = subscriptionService;
        _creatorSubscriptionTransformer = creatorSubscriptionTransformer;
    }

    public async Task<OutputCreator> Transform(Creator creator)
    {

        var subscription = await _subscriptionService.GetActiveCreatorSubscription(creator.Id);
        var subscriptionTransformer = _creatorSubscriptionTransformer.Transform(subscription);

        return new OutputCreator
        {
            Id = creator.Id,
            UserId = creator.UserId,
            Username = creator.Username,
            Subscription = subscriptionTransformer,
            Status = creator.Status,
            CreatorApplicationId = creator.CreatorApplicationId,
            SocialMedia = creator.SocialMedia,
            CreatedAt = creator.CreatedAt,
            UpdatedAt = creator.UpdatedAt,
        };
    }
}