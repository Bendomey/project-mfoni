

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorSubscriptionTransformer
{

    private readonly SubscriptionService _subscriptionService;
    private readonly CreatorSubscriptionPurchaseTransformer _creatorSubscriptionPurchaseTransformer;

    public CreatorSubscriptionTransformer(SubscriptionService subscriptionService, CreatorSubscriptionPurchaseTransformer creatorSubscriptionPurchaseTransformer)
    {
        _subscriptionService = subscriptionService;
        _creatorSubscriptionPurchaseTransformer = creatorSubscriptionPurchaseTransformer;
    }

    public async Task<OutputCreatorSubscription> Transform(CreatorSubscription creatorSubscription)
    {
        var purchases = await _subscriptionService.GetSubscriptionPurchases(creatorSubscription.Id);

        var purchasesTransformed = purchases.Select(purchase => _creatorSubscriptionPurchaseTransformer.Transform(purchase)).ToList();

        return new OutputCreatorSubscription
        {
            Id = creatorSubscription.Id,
            PackageType = creatorSubscription.PackageType,
            Period = creatorSubscription.Period,
            StartedAt = creatorSubscription.StartedAt,
            EndedAt = creatorSubscription.EndedAt,
            CreatorSubscriptionPurchases = purchasesTransformed,
            CreatedAt = creatorSubscription.CreatedAt,
            UpdatedAt = creatorSubscription.UpdatedAt,
        };
    }
}