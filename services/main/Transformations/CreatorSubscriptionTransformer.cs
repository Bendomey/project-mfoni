

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorSubscriptionTransformer
{
    private readonly MfoniPackageService _mfoniPackageService;
    private readonly MfoniPackageTransformer _mfoniPackageTransformer;
    private readonly SubscriptionService _subscriptionService;
    private readonly CreatorSubscriptionPurchaseTransformer _creatorSubscriptionPurchaseTransformer;

    public CreatorSubscriptionTransformer(
        SubscriptionService subscriptionService,
        CreatorSubscriptionPurchaseTransformer creatorSubscriptionPurchaseTransformer,
        MfoniPackageService mfoniPackageService,
        MfoniPackageTransformer mfoniPackageTransformer
    )
    {
        _subscriptionService = subscriptionService;
        _creatorSubscriptionPurchaseTransformer = creatorSubscriptionPurchaseTransformer;
        _mfoniPackageService = mfoniPackageService;
        _mfoniPackageTransformer = mfoniPackageTransformer;
    }

    public async Task<OutputCreatorSubscription> Transform(CreatorSubscription creatorSubscription, string[]? populate = null)
    {
        populate ??= Array.Empty<string>();

        List<OutputCreatorSubscriptionPurchase>? purchasesTransformed = null;
        if (populate.Any(p => p.Contains(PopulateKeys.PURCHASE)))
        {
            purchasesTransformed = [];
            var purchases = await _subscriptionService.GetSubscriptionPurchases(creatorSubscription.Id);

            purchasesTransformed = (await Task.WhenAll(purchases.Select(purchase => _creatorSubscriptionPurchaseTransformer.Transform(purchase, populate)))).ToList();
        }

        OutputMfoniPackage? mfoniPackage = null;
        if (populate.Any(p => p.Contains(PopulateKeys.MFONI_PACKAGE)))
        {
            var rawMfoniPackage = await _mfoniPackageService.GetById(creatorSubscription.PackageTypeId);
            if (rawMfoniPackage is not null)
            {
                mfoniPackage = _mfoniPackageTransformer.Transform(rawMfoniPackage);
            }
        }

        return new OutputCreatorSubscription
        {
            Id = creatorSubscription.Id,
            MfoniPackageId = creatorSubscription.PackageTypeId,
            MfoniPackage = mfoniPackage,
            Period = creatorSubscription.Period,
            StartedAt = creatorSubscription.StartedAt,
            EndedAt = creatorSubscription.EndedAt,
            CreatorSubscriptionPurchases = purchasesTransformed,
            CreatedAt = creatorSubscription.CreatedAt,
            UpdatedAt = creatorSubscription.UpdatedAt,
        };
    }
}