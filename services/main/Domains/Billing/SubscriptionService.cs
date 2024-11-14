using main.Configuratons;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Domains;

public class SubscriptionService
{
    private readonly ILogger<SubscriptionService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly WalletService _walletService;
    private readonly IMongoCollection<Models.CreatorSubscriptionPurchase> _creatorSubscriptionPurchaseCollection;

    public SubscriptionService(
           ILogger<SubscriptionService> logger,
           DatabaseSettings databaseConfig,
           IOptions<AppConstants> appConstants,
            UserService userService,
            WalletService walletService
       )
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;
        _walletService = walletService;

        var database = databaseConfig.Database;
        _creatorSubscriptionPurchaseCollection = database.GetCollection<Models.CreatorSubscriptionPurchase>(
            appConstants.Value.CreatorSubscriptionPurchaseCollection
        );

        logger.LogDebug("Subscription service initialized");
    }

    public async Task SubscribeWithWallet(SubscribeWithWalletInput input)
    {
        // withdraw from user
        var wallet = await _walletService.Withdraw(new WalletWithdrawInput
        {
            Amount = input.Amount,
            UserId = input.UserId,
            ReasonForTransfer = WalletTransactionReasonForTransfer.SUBSCRIPTION,
        });

        // deposit to admin
        await _walletService.Deposit(new WalletDepositInput
        {
            Amount = input.Amount,
            UserId = "SYSTEM",
            ReasonForTransfer = WalletTransactionReasonForTransfer.SUBSCRIPTION,
        });

        var newSubscriptionPurchase = new Models.CreatorSubscriptionPurchase
        {
            CreatorSubscriptionId = input.SubscriptionId,
            Type = CreatorSubscriptionPurchaseType.WALLET,
            WalletId = wallet.Id,
            Amount = input.Amount
        };

        await _creatorSubscriptionPurchaseCollection.InsertOneAsync(newSubscriptionPurchase);

    }

}