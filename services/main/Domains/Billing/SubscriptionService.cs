using main.Configurations;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Domains;

public class SubscriptionService
{
    private readonly ILogger<SubscriptionService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly WalletService _walletService;
    private readonly UserService _userService;
    private readonly IMongoCollection<Models.Creator> _creatorCollection;
    private readonly IMongoCollection<Models.CreatorSubscription> _creatorSubscriptionCollection;
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
        _userService = userService;

        var database = databaseConfig.Database;
        _creatorSubscriptionPurchaseCollection = database.GetCollection<Models.CreatorSubscriptionPurchase>(
            appConstants.Value.CreatorSubscriptionPurchaseCollection
        );

        _creatorSubscriptionCollection = database.GetCollection<Models.CreatorSubscription>(
            appConstants.Value.CreatorSubscriptionCollection
        );


        _creatorCollection = database.GetCollection<Models.Creator>(
           appConstants.Value.CreatorCollection
        );

        logger.LogDebug("Subscription service initialized");
    }

    public async Task RenewSubscription(Models.CreatorSubscription creatorSubscription)
    {
        // This should never happen. All paid subscriptions should have an end date(renewal date).
        if (creatorSubscription.EndedAt is null)
        {
            throw new HttpRequestException("SubscriptionEndDateNotSet");
        }

        // know the creator and subscription.
        var creator = await _creatorCollection.Find(user => user.Id == creatorSubscription.CreatorId).FirstOrDefaultAsync();
        if (creator is null)
        {
            throw new HttpRequestException("CreatorNotFound");
        }

        // the base user involved.
        var user = await _userService.GetUserById(creator.UserId);

        // check if they have enough balance to renew
        var pricingLib = new PricingLib(creatorSubscription.PackageType);
        bool canIPay = user.BookWallet >= pricingLib.GetPrice();
        DateTime renewalDate = (DateTime)creatorSubscription.EndedAt;
        DateTime today = DateTime.Today;

        if (canIPay)
        {
            _logger.LogDebug($"User {user.Id} has enough balance to renew subscription");

            //  check if renewal date is due
            if (today.Date >= renewalDate.Date)
            {
                _logger.LogInformation($"User {user.Id} is renewing subscription");
                DateTime nextRenewalDate = today.AddMonths(1);

                // renew their subscription
                var newSubscription = new Models.CreatorSubscription
                {
                    CreatorId = creator.Id,
                    PackageType = creatorSubscription.PackageType,
                    StartedAt = DateTime.UtcNow,
                    EndedAt = nextRenewalDate,
                    Period = 1, // 1 Month
                };

                await _creatorSubscriptionCollection.InsertOneAsync(newSubscription);

                await this.SubscribeWithWallet(new SubscribeWithWalletInput
                {
                    Amount = pricingLib.GetPrice(),
                    SubscriptionId = newSubscription.Id,
                    UserId = user.Id
                });

                // send them a notification that their subscription has been renewed.
                SendNotification(
                    user,
                    EmailTemplates.SuccessfulSubscriptionSubject,
                    EmailTemplates.SuccessfulSubscriptionBody
                        .Replace("{name}", user.Name)
                        .Replace("{package}", pricingLib.GetPackageName())
                        .Replace("{renewalDate}", today.ToString("dd/MM/yyyy"))
                        .Replace("{nextRenewalDate}", nextRenewalDate.ToString("dd/MM/yyyy"))
                        .Replace("{renewalAmount}", MoneyLib.ConvertPesewasToCedis(pricingLib.GetPrice()) + ".00")
                );
                return;
            }

            // wait for their renewal date to come and then renew their subscription
            _logger.LogDebug($"User {user.Id} is waiting for renewal date to renew subscription");
            return;

        }
        else
        {
            _logger.LogDebug($"User {user.Id} does not have enough balance to renew subscription");

            DateTime startDateOf5dayThreshold = renewalDate.AddDays(-5);
            if (today.Date >= startDateOf5dayThreshold.Date && today.Date <= renewalDate.Date)
            {
                _logger.LogDebug($"We are alerting User {user.Id} to topup their wallet");

                int daysLeft = (renewalDate.Date - today.Date).Days;

                // send them a notification to top up their wallet
                SendNotification(
                    user,
                    EmailTemplates.RemindingSubscribersToTopupTheirWalletSubject
                        .Replace("{days}", daysLeft.ToString()),
                    EmailTemplates.RemindingSubscribersToTopupTheirWalletBody
                        .Replace("{name}", user.Name)
                        .Replace("{days}", daysLeft.ToString())
                        .Replace("{package}", pricingLib.GetPackageName())
                        .Replace("{renewalDate}", renewalDate.ToString("dd/MM/yyyy"))
                );
            }
            else if (today.Date > renewalDate.Date)
            {
                // check if they've exceeded the grace period. For now it's 3 days after their subscription expires.
                int daysOverdue = (today.Date - renewalDate.Date).Days;

                if (daysOverdue > 0 && daysOverdue <= 3)
                {
                    _logger.LogDebug($"We are alerting User {user.Id} to topup their wallet. Payment is overdue");

                    // send them an overdue notification
                    SendNotification(
                        user,
                        EmailTemplates.RemindingOverDueSubscribersToTopupTheirWalletSubject,
                        EmailTemplates.RemindingOverdueSubscribersToTopupTheirWalletBody
                            .Replace("{name}", user.Name)
                            .Replace("{package}", pricingLib.GetPackageName())
                            .Replace("{renewalDate}", renewalDate.ToString("dd/MM/yyyy"))
                    );
                }
                else if (daysOverdue > 3)
                {
                    _logger.LogDebug($"Demoting {user.Id} to free tier.");
                    // demote them to the free tier
                    await CreateAFreeTierSubscription(creator.Id);

                    // send a sorry notification for demotion.
                    SendNotification(
                        user,
                        EmailTemplates.FailedSubscriptionSubject,
                        EmailTemplates.FailedSubscriptionBody
                            .Replace("{name}", user.Name)
                            .Replace("{package}", pricingLib.GetPackageName())
                            .Replace("{renewalDate}", renewalDate.ToString("dd/MM/yyyy"))
                    );
                }
            }
        }

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

    public async Task<CreatorSubscription> CreateAFreeTierSubscription(string creatorId, DateTime? startDate = null)
    {
        var freeTierSubscription = new Models.CreatorSubscription
        {
            CreatorId = creatorId,
            PackageType = CreatorSubscriptionPackageType.FREE,
            StartedAt = startDate is not null ? (DateTime)startDate : DateTime.UtcNow,
        };

        await _creatorSubscriptionCollection.InsertOneAsync(freeTierSubscription);

        return freeTierSubscription;
    }

    private void SendNotification(Models.User user, string subject, string body)
    {
        if (user.PhoneNumber is not null && user.PhoneNumberVerifiedAt is not null)
        {
            var _ = SmsConfiguration.SendSms(new SendSmsInput
            {
                PhoneNumber = user.PhoneNumber,
                Message = body,
                AppId = _appConstantsConfiguration.SmsAppId,
                AppSecret = _appConstantsConfiguration.SmsAppSecret
            });
        }

        if (user.Email is not null && user.EmailVerifiedAt is not null)
        {
            var _ = EmailConfiguration.Send(new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = user.Email,
                Subject = subject,
                Message = body,
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }
    }
}