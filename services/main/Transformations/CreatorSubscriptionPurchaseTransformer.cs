

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorSubscriptionPurchaseTransformer
{

    private readonly WalletService _walletService;
    private readonly WalletTransactionTransformer _walletTransactionTransformer;
    public CreatorSubscriptionPurchaseTransformer(WalletService walletService, WalletTransactionTransformer walletTransactionTransformer)
    {

        _walletService = walletService;
        _walletTransactionTransformer = walletTransactionTransformer;
    }

    public async Task<OutputCreatorSubscriptionPurchase> Transform(CreatorSubscriptionPurchase creatorSubscriptionPurchase, string[]? populate = null)
    {

        populate ??= Array.Empty<string>();

        OutputWalletTransaction? walletTransactionTransformed = null;
        if (creatorSubscriptionPurchase.WalletId is not null && populate.Any(p => p.Contains(PopulateKeys.WALLET)))
        {
            var walletTransaction = await _walletService.GetWalletById(creatorSubscriptionPurchase.WalletId);
            walletTransactionTransformed = await _walletTransactionTransformer.Transform(walletTransaction, populate);
        }

        return new OutputCreatorSubscriptionPurchase
        {
            Id = creatorSubscriptionPurchase.Id,
            CreatorSubscriptionId = creatorSubscriptionPurchase.CreatorSubscriptionId,
            Type = creatorSubscriptionPurchase.Type,
            SavedCardId = creatorSubscriptionPurchase.SavedCardId,
            WalletId = creatorSubscriptionPurchase.WalletId,
            WalletTransaction = walletTransactionTransformed,
            Amount = creatorSubscriptionPurchase.Amount,
            CreatedAt = creatorSubscriptionPurchase.CreatedAt,
            UpdatedAt = creatorSubscriptionPurchase.UpdatedAt,
        };
    }
}