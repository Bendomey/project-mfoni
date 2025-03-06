


using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class ContentPurchaseTransformer
{
    private readonly UserService _userService;
    private readonly UserTransformer _userTransformer;
    private readonly WalletService _walletTransactionService;
    private readonly WalletTransactionTransformer _walletTransactionTransformer;
    private readonly PaymentService _paymentService;
    private readonly PaymentTransformer _paymentTransformer;
    private readonly SearchContentService _contentService;
    private readonly ContentTransformer _contentTransformer;
    private readonly CacheProvider _cacheProvider;

    public ContentPurchaseTransformer(
        UserService userService,
        WalletService walletService,
        WalletTransactionTransformer walletTransformer,
        PaymentService paymentService,
        PaymentTransformer paymentTransformer,
        SearchContentService contentService,
        ContentTransformer contentTransformer,
        UserTransformer userTransformer,
        CacheProvider cacheProvider
    )
    {
        _userService = userService;
        _walletTransactionService = walletService;
        _walletTransactionTransformer = walletTransformer;
        _paymentService = paymentService;
        _paymentTransformer = paymentTransformer;
        _contentService = contentService;
        _contentTransformer = contentTransformer;
        _userTransformer = userTransformer;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputContentPurchase> Transform(ContentPurchase contentPurchase, string[]? populate = null, string? userId = null)
    {

        populate ??= Array.Empty<string>();

        OutputContent? content = null;
        if (contentPurchase.ContentId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT_PURCHASE_CONTENT)))
        {
            var contentData = await _contentService.GetContentById(contentPurchase.Id);
            if (contentData is not null)
            {
                content = await _contentTransformer.Transform(contentData, populate, userId);
            }
        }

        OutputPayment? payment = null;
        if (contentPurchase.PaymentId is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT_PURCHASE_PAYMENT)))
        {
            var paymentData = await _paymentService.GetPaymentById(contentPurchase.PaymentId);
            if (paymentData is not null)
            {
                payment = _paymentTransformer.Transform(paymentData, populate);
            }
        }

        OutputWalletTransaction? walletFrom = null;
        if (contentPurchase.WalletFrom is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT_PURCHASE_WALLET_FROM)))
        {
            var walletData = await _walletTransactionService.GetWalletById(contentPurchase.WalletFrom);
            if (walletData is not null)
            {
                walletFrom = await _walletTransactionTransformer.Transform(walletData, populate);
            }
        }

        OutputWalletTransaction? walletTo = null;
        if (contentPurchase.WalletTo is not null && populate.Any(p => p.Contains(PopulateKeys.CONTENT_PURCHASE_WALLET_TO)))
        {
            var walletData = await _walletTransactionService.GetWalletById(contentPurchase.WalletTo);
            if (walletData is not null)
            {
                walletTo = await _walletTransactionTransformer.Transform(walletData, populate);
            }
        }

        OutputBasicUser? outputCreatedByUser = null;
        if (contentPurchase.UserId is not null && populate.Any(p => p.Contains(PopulateKeys.TAG_CREATED_BY_USER)))
        {
            var createdBy = await _cacheProvider.ResolveCache($"users.{contentPurchase.UserId}", () => _userService.GetUserById(contentPurchase.UserId));
            if (createdBy is not null)
            {
                outputCreatedByUser = _userTransformer.TransformBasicUser(createdBy);
            }
        }

        return new OutputContentPurchase
        {
            Id = contentPurchase.Id,
            Amount = contentPurchase.Amount,
            ContentId = contentPurchase.ContentId,
            Status = contentPurchase.Status,
            Type = contentPurchase.Type,
            Content = content,
            CreatedById = contentPurchase.UserId,
            CreatedBy = outputCreatedByUser,
            PaymentId = contentPurchase.PaymentId,
            Payment = payment,
            WalletFromId = contentPurchase.WalletFrom,
            WalletFrom = walletFrom,
            WalletToId = contentPurchase.WalletTo,
            WalletTo = walletTo,
            CreatedAt = contentPurchase.CreatedAt,
            UpdatedAt = contentPurchase.UpdatedAt,
        };
    }
}