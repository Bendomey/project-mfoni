using main.Configurations;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
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
                DateTime nextRenewalDate = today.AddDays(30);

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
                    EmailTemplates.SuccessfulSubscriptionRenewalSubject,
                    EmailTemplates.SuccessfulSubscriptionRenewalBody
                        .Replace("{name}", user.Name)
                        .Replace("{package}", pricingLib.GetPackageName())
                        .Replace("{renewalDate}", today.ToString("dd/MM/yyyy"))
                        .Replace("{nextRenewalDate}", nextRenewalDate.ToString("dd/MM/yyyy"))
                        .Replace("{renewalAmount}", $"{MoneyLib.ConvertPesewasToCedis(pricingLib.GetPrice()):0.00}")
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

    public async Task RefundToWallet(SubscribeWithWalletInput input)
    {
        // withdraw from admin
        var wallet = await _walletService.Withdraw(new WalletWithdrawInput
        {
            Amount = input.Amount,
            UserId = "SYSTEM",
            ReasonForTransfer = WalletTransactionReasonForTransfer.SUBSCRIPTION_REFUND,
        });

        // deposit to user
        await _walletService.Deposit(new WalletDepositInput
        {
            Amount = input.Amount,
            UserId = input.UserId,
            ReasonForTransfer = WalletTransactionReasonForTransfer.SUBSCRIPTION_REFUND,
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

    // get creators who are due for subscription renewal.
    public async Task<List<CreatorSubscription>> GetSubscribersDueForRenewal()
    {
        var pipeline = new[]
        {
            // Sort by createdAt in descending order
            new BsonDocument("$sort", new BsonDocument("created_at", -1)),

            // Group by creatorId and get the latest record (first one after sorting)
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$creator_id" },
                { "latestRecord", new BsonDocument("$first", "$$ROOT") }
            }),

            // Match the latestRecord where packageType is not "FREE" and endDate.AddDays(-5) <= today.
            new BsonDocument("$match", new BsonDocument
            {
                { "latestRecord.package_type", new BsonDocument("$ne", CreatorSubscriptionPackageType.FREE) },

                { "$expr", new BsonDocument("$and",  new BsonArray
                    {
                        new BsonDocument("$gte", new BsonArray
                        {
                            "$$NOW",
                            new BsonDocument("$subtract", new BsonArray
                            {
                                "$latestRecord.ended_at",
                                5 * 24 * 60 * 60 * 1000 // 5 days in milliseconds
                            })
                        })
                    })
                }
            }),

            // Replace the root with the latestRecord
            new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$latestRecord"))
        };

        return await _creatorSubscriptionCollection
            .Aggregate<CreatorSubscription>(pipeline)
            .ToListAsync();
    }


    public async Task<CreatorSubscription?> IsSubscriptionCancelled(string creatorSubscriptionId)
    {

        var sub = await _creatorSubscriptionCollection.Find(sub => sub.Id == creatorSubscriptionId).FirstOrDefaultAsync();

        if (sub is null)
        {
            throw new HttpRequestException("CreatorSubscriptionNotFound");
        }

        var filter = Builders<CreatorSubscription>.Filter.And(
            Builders<CreatorSubscription>.Filter.Eq("creator_id", ObjectId.Parse(sub.CreatorId)),
             Builders<CreatorSubscription>.Filter.And(
                Builders<CreatorSubscription>.Filter.Eq("package_type", CreatorSubscriptionPackageType.FREE),
                Builders<CreatorSubscription>.Filter.Gte("started_at", sub.EndedAt),
                Builders<CreatorSubscription>.Filter.Eq("ended_at", BsonNull.Value)
            )
        );


        var cancelledSubscription = await _creatorSubscriptionCollection.Find(filter).FirstOrDefaultAsync();

        return cancelledSubscription is null ? null : cancelledSubscription;
    }

    public async Task<CreatorSubscription> GetActiveCreatorSubscription(string creatorId)
    {

        var today = DateTime.UtcNow;
        var filter = Builders<CreatorSubscription>.Filter.And(
            Builders<CreatorSubscription>.Filter.Eq("creator_id", ObjectId.Parse(creatorId)),
            Builders<CreatorSubscription>.Filter.Or(
                Builders<CreatorSubscription>.Filter.And(
                    Builders<CreatorSubscription>.Filter.Ne("package_type", CreatorSubscriptionPackageType.FREE),
                    Builders<CreatorSubscription>.Filter.Lte("started_at", today),
                    Builders<CreatorSubscription>.Filter.Gt("ended_at", today)
                ),
                Builders<CreatorSubscription>.Filter.And(
                    Builders<CreatorSubscription>.Filter.Eq("package_type", CreatorSubscriptionPackageType.FREE),
                    Builders<CreatorSubscription>.Filter.Lte("started_at", today),
                    Builders<CreatorSubscription>.Filter.Eq("ended_at", BsonNull.Value)
                )
            )
        );


        var activeSubscription = await _creatorSubscriptionCollection.Find(filter).FirstOrDefaultAsync();

        if (activeSubscription is null)
        {
            throw new HttpRequestException("CreatorSubscriptionNotFound");
        }

        return activeSubscription;
    }

    public async Task<CreatorSubscription> ActivateCreatorSubscription(ActivateCreatorSubscriptionInput input)
    {
        var creator = await _creatorCollection.Find(creator => creator.Id == input.CreatorId).FirstOrDefaultAsync();
        var user = await _userService.GetUserById(creator.UserId);

        // check if the creator has an active subscription.
        var activeSubscription = await GetActiveCreatorSubscription(input.CreatorId);

        var pricingLib = new PricingLib(input.PricingPackage);

        if (activeSubscription.PackageType == CreatorSubscriptionPackageType.FREE)
        {

            var pricing = pricingLib.GetPrice() * input.Period;
            bool canIPayWithWallet = user.BookWallet >= pricing;

            if (!canIPayWithWallet)
            {
                throw new HttpRequestException("InsufficientFundsInWallet");
            }

            // end the free tier
            await _creatorSubscriptionCollection.UpdateOneAsync(
                subscription => subscription.Id == activeSubscription.Id,
                Builders<CreatorSubscription>.Update.Set(subscription => subscription.EndedAt, DateTime.UtcNow)
            );

            var today = DateTime.UtcNow;
            var nextRenewalDate = DateTime.UtcNow.AddDays(input.Period * 30);

            // Create a trail of the package the creator has been activated.
            var creatorSubscription = new CreatorSubscription
            {
                CreatorId = creator.Id,
                PackageType = input.PricingPackage,
                Period = input.Period,
                StartedAt = DateTime.UtcNow,
                EndedAt = nextRenewalDate,
            };

            await _creatorSubscriptionCollection.InsertOneAsync(creatorSubscription);

            await SubscribeWithWallet(new SubscribeWithWalletInput
            {
                Amount = pricingLib.GetPrice(),
                SubscriptionId = creatorSubscription.Id,
                UserId = user.Id
            });

            // send them a notification that their subscription has been successful.
            SendNotification(
                user,
                EmailTemplates.SuccessfulSubscriptionSubject,
                EmailTemplates.SuccessfulSubscriptionBody
                    .Replace("{name}", user.Name)
                    .Replace("{package}", pricingLib.GetPackageName())
                    .Replace("{startDate}", today.ToString("dd/MM/yyyy"))
                    .Replace("{renewalDate}", nextRenewalDate.ToString("dd/MM/yyyy"))
                    .Replace("{renewalAmount}", $"{MoneyLib.ConvertPesewasToCedis(pricing):0.00}")
            );

            return creatorSubscription;
        }

        var activeSubPricingLib = new PricingLib(activeSubscription.PackageType);
        var pricingChange = activeSubPricingLib.DetermineIfItsAnUpgradeOrDowngrade(input.PricingPackage);

        if (pricingChange == "NO_CHANGE")
        {
            // make sure the subscription wasn't cancelled.
            var cancelledSubscriptionRecord = await IsSubscriptionCancelled(activeSubscription.Id);

            if (cancelledSubscriptionRecord is not null)
            {
                await _creatorSubscriptionCollection.DeleteOneAsync(subscription => subscription.Id == cancelledSubscriptionRecord.Id);

                return activeSubscription;
            }

            throw new HttpRequestException("AlreadySubscribedToPackage");
        }

        // make sure the active subscription wasn't cancelled.
        var __cancelledSubscriptionRecord = await IsSubscriptionCancelled(activeSubscription.Id);

        if (__cancelledSubscriptionRecord is not null)
        {
            await _creatorSubscriptionCollection.DeleteOneAsync(subscription => subscription.Id == __cancelledSubscriptionRecord.Id);
        }

        // ======================= UPGRADE THE SUBSCRIPTION. =============================

        if (pricingChange == "UPGRADE")
        {
            var upgradeEffect = input.UpgradeEffect is not null ? input.UpgradeEffect : "INSTANT";

            if (upgradeEffect == "INSTANT")
            {
                var today = DateTime.UtcNow;

                // calculate how much the person has paid for the old billing.
                var activePricingLib = new PricingLib(activeSubscription.PackageType);
                int daysSubscribedFor = (activeSubscription.EndedAt?.Date - activeSubscription.StartedAt.Date)?.Days ?? 0;
                int daysUsed = (today.Date - activeSubscription.StartedAt.Date).Days;
                var pricingForWhatsBeenUsed = activePricingLib.GetPricePerDay() * daysUsed;
                var pricingForTotal = activePricingLib.GetPricePerDay() * daysSubscribedFor;
                Int64 remainingAmount = (Int64)(pricingForTotal - pricingForWhatsBeenUsed);

                // calculate the balance
                var newUpgradeSubEndDate = DateTime.UtcNow.AddDays(input.Period * 30);
                int daysLeft = (newUpgradeSubEndDate.Date - today.Date).Days;

                Int64 pricingForWhatToPayFor = (Int64)(pricingLib.GetPricePerDay() * daysLeft);

                Int64 yourMoney = remainingAmount + user.BookWallet;
                bool canIPayWithWallet = yourMoney >= pricingForWhatToPayFor;

                if (!canIPayWithWallet)
                {
                    throw new HttpRequestException("InsufficientFundsInWallet");
                }

                // end the current subscription
                await _creatorSubscriptionCollection.UpdateOneAsync(
                    subscription => subscription.Id == activeSubscription.Id,
                    Builders<CreatorSubscription>.Update.Set(subscription => subscription.EndedAt, DateTime.UtcNow)
                );

                var newUpgradeSub = new CreatorSubscription
                {
                    CreatorId = creator.Id,
                    PackageType = input.PricingPackage,
                    Period = input.Period,
                    StartedAt = DateTime.UtcNow,
                    EndedAt = newUpgradeSubEndDate,
                };

                await _creatorSubscriptionCollection.InsertOneAsync(newUpgradeSub);

                // refund 
                await RefundToWallet(new SubscribeWithWalletInput
                {
                    Amount = remainingAmount,
                    SubscriptionId = activeSubscription.Id,
                    UserId = user.Id
                });

                await SubscribeWithWallet(new SubscribeWithWalletInput
                {
                    Amount = pricingForWhatToPayFor,
                    SubscriptionId = newUpgradeSub.Id,
                    UserId = user.Id
                });

                SendNotification(
                    user,
                    EmailTemplates.SuccessfulSubscriptionImmediateUpgradeSubject
                        .Replace("{package}", pricingLib.GetPackageName()),
                    EmailTemplates.SuccessfulSubscriptionImmediateUpgradeBody
                        .Replace("{name}", user.Name)
                        .Replace("{package}", pricingLib.GetPackageName())
                        .Replace("{upgradeAmount}", $"{MoneyLib.ConvertPesewasToCedis(pricingForWhatToPayFor):0.00}")
                        .Replace("{effectiveDate}", today.ToString("dd/MM/yyyy"))
                        .Replace("{renewalDate}", newUpgradeSubEndDate.ToString("dd/MM/yyyy"))
                );

                return newUpgradeSub;
            }
            else if (upgradeEffect == "DEFER")
            {
                var newUpgradeSubStartDate = (DateTime)activeSubscription.EndedAt!;

                // this will help cron job to know what new subscription to renew.
                var upgradeDeferNextRenewalDate = newUpgradeSubStartDate.AddDays(1);
                var newUpgradeSub = new CreatorSubscription
                {
                    CreatorId = creator.Id,
                    PackageType = input.PricingPackage,
                    Period = 0.1,
                    StartedAt = newUpgradeSubStartDate,
                    EndedAt = upgradeDeferNextRenewalDate,
                };
                await _creatorSubscriptionCollection.InsertOneAsync(newUpgradeSub);

                SendNotification(
                    user,
                    EmailTemplates.SuccessfulSubscriptionScheduledUpgradeSubject
                        .Replace("{package}", pricingLib.GetPackageName()),
                    EmailTemplates.SuccessfulSubscriptionScheduledUpgradeBody
                        .Replace("{name}", user.Name)
                        .Replace("{package}", pricingLib.GetPackageName())
                        .Replace("{nextRenewalDate}", upgradeDeferNextRenewalDate.ToString("dd/MM/yyyy"))
                        .Replace("{newMonthlyFee}", $"{MoneyLib.ConvertPesewasToCedis(pricingLib.GetPrice()):0.00}")
                );

                return newUpgradeSub;
            }

            throw new HttpRequestException("InvalidUpgradeEffect");
        }

        // ======================= DOWNGRADE THE SUBSCRIPTION. =============================

        var newDowngradeSubStartDate = (DateTime)activeSubscription.EndedAt!;
        var downgradeNextRenewalDate = newDowngradeSubStartDate.AddDays(1);
        var currentPricingLib = new PricingLib(activeSubscription.PackageType);

        // this will help cron job to know what new subscription to renew.
        var newDowngradeSub = new CreatorSubscription
        {
            CreatorId = creator.Id,
            PackageType = input.PricingPackage,
            Period = 0.1,
            StartedAt = newDowngradeSubStartDate,
            EndedAt = downgradeNextRenewalDate,
        };
        await _creatorSubscriptionCollection.InsertOneAsync(newDowngradeSub);

        SendNotification(
            user,
            EmailTemplates.SuccessfulSubscriptionScheduledDowngradeSubject
                .Replace("{package}", pricingLib.GetPackageName()),
            EmailTemplates.SuccessfulSubscriptionScheduledDowngradeBody
                .Replace("{name}", user.Name)
                .Replace("{package}", pricingLib.GetPackageName())
                .Replace("{currentPackage}", currentPricingLib.GetPackageName())
                .Replace("{currentCycleEndDate}", newDowngradeSubStartDate.ToString("dd/MM/yyyy"))
                .Replace("{nextRenewalDate}", downgradeNextRenewalDate.ToString("dd/MM/yyyy"))
                .Replace("{newMonthlyFee}", $"{MoneyLib.ConvertPesewasToCedis(pricingLib.GetPrice()):0.00}")
        );

        return newDowngradeSub;
    }

    public async Task<CreatorSubscription> CancelCreatorSubscription(string creatorId)
    {
        var creator = await _creatorCollection.Find(creator => creator.Id == creatorId).FirstOrDefaultAsync();
        if (creator is null)
        {
            throw new HttpRequestException("CreatorNotFound");
        }

        var user = await _userService.GetUserById(creator.UserId);

        // find last subscription of creator based on date created
        var lastSubscription = await _creatorSubscriptionCollection.Find(subscription => subscription.CreatorId == creatorId)
            .SortByDescending(subscription => subscription.CreatedAt)
            .FirstOrDefaultAsync();

        // if it's free, then we don't do anything.
        if (lastSubscription.PackageType == CreatorSubscriptionPackageType.FREE)
        {
            throw new HttpRequestException("AlreadyOnFreeTier");
        }

        // if it's premium, then we cancel it by creating a new subscription record with FREE as the package type.
        var newSubscription = await CreateAFreeTierSubscription(creatorId, lastSubscription.EndedAt);

        if (lastSubscription.EndedAt is null)
        {
            throw new HttpRequestException("SubscriptionEndDateNotFound");
        }

        DateTime expiryDate = (DateTime)lastSubscription.EndedAt;

        var pricingLib = new PricingLib(lastSubscription.PackageType);

        SendNotification(
            user,
            EmailTemplates.CreatorSubscriptionCancelledSubject
                .Replace("{expiryDate}", expiryDate.ToString("dd/MM/yyyy")),
            EmailTemplates.CreatorSubscriptionCancelledBody
                .Replace("{name}", user.Name)
                .Replace("{package}", pricingLib.GetPackageName())
                .Replace("{cancellationDate}", DateTime.UtcNow.ToString("dd/MM/yyyy"))
                .Replace("{expiryDate}", expiryDate.ToString("dd/MM/yyyy"))
        );

        return newSubscription;
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

    public async Task<List<Models.CreatorSubscription>> GetSubscriptions(
        FilterQuery<Models.CreatorSubscription> queryFilter,
        GetSubscriptionsInput input
    )
    {
        FilterDefinitionBuilder<Models.CreatorSubscription> builder = Builders<Models.CreatorSubscription>.Filter;
        var userIdFilter = builder.Eq(sub => sub.CreatorId, input.CreatorId);
        var typeFilter = builder.Eq(sub => sub.PackageType, input.PackageType);


        var filters = Builders<CreatorSubscription>.Filter.And(userIdFilter);

        if (input.PackageType is not null)
        {
            filters = Builders<CreatorSubscription>.Filter.And(userIdFilter, typeFilter);
        }

        var subs = await _creatorSubscriptionCollection
            .Find(filters)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return subs ?? [];
    }

    public async Task<long> CountSubscriptions(GetSubscriptionsInput input)
    {
        FilterDefinitionBuilder<Models.CreatorSubscription> builder = Builders<Models.CreatorSubscription>.Filter;
        var userIdFilter = builder.Eq(wallet => wallet.CreatorId, input.CreatorId);
        var typeFilter = builder.Eq(wallet => wallet.PackageType, input.PackageType);


        var filters = Builders<CreatorSubscription>.Filter.And(userIdFilter);

        if (input.PackageType is not null)
        {
            filters = Builders<CreatorSubscription>.Filter.And(userIdFilter, typeFilter);
        }


        long usersCount = await _creatorSubscriptionCollection.CountDocumentsAsync(filters);
        return usersCount;
    }

    public async Task<List<Models.CreatorSubscriptionPurchase>> GetSubscriptionPurchases(
        string creatorSubscriptionId
    )
    {
        FilterDefinitionBuilder<Models.CreatorSubscriptionPurchase> builder = Builders<Models.CreatorSubscriptionPurchase>.Filter;
        var creatorSubscriptionIdFilter = builder.Eq(sub => sub.CreatorSubscriptionId, creatorSubscriptionId);


        var filters = Builders<CreatorSubscriptionPurchase>.Filter.And(creatorSubscriptionIdFilter);

        var subsPurchases = await _creatorSubscriptionPurchaseCollection
            .Find(filters)
            .ToListAsync();

        return subsPurchases ?? [];
    }


}