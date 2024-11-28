

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorSubscriptionPurchaseTransformer
{

    public CreatorSubscriptionPurchaseTransformer()
    {
    }

    public OutputCreatorSubscriptionPurchase Transform(CreatorSubscriptionPurchase creatorSubscriptionPurchase)
    {
        return new OutputCreatorSubscriptionPurchase
        {
            Id = creatorSubscriptionPurchase.Id,
            CreatorSubscriptionId = creatorSubscriptionPurchase.CreatorSubscriptionId,
            Type = creatorSubscriptionPurchase.Type,
            SavedCardId = creatorSubscriptionPurchase.SavedCardId,
            WalletId = creatorSubscriptionPurchase.WalletId,
            Amount = creatorSubscriptionPurchase.Amount,
            CreatedAt = creatorSubscriptionPurchase.CreatedAt,
            UpdatedAt = creatorSubscriptionPurchase.UpdatedAt,
        };
    }
}