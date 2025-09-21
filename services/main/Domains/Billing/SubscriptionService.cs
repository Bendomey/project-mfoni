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
    private readonly IMongoCollection<Models.MfoniPackage> _mfoniPackageCollection;
    private readonly CacheProvider _cacheProvider;

    public SubscriptionService(
           ILogger<SubscriptionService> logger,
           DatabaseSettings databaseConfig,
           IOptions<AppConstants> appConstants,
            UserService userService,
            WalletService walletService,
            CacheProvider cacheProvider
       )
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;
        _walletService = walletService;
        _userService = userService;
        _cacheProvider = cacheProvider;

        var database = databaseConfig.Database;
        _creatorSubscriptionPurchaseCollection = database.GetCollection<Models.CreatorSubscriptionPurchase>(
            appConstants.Value.CreatorSubscriptionPurchaseCollection
        );

        _creatorSubscriptionCollection = database.GetCollection<Models.CreatorSubscription>(
            appConstants.Value.CreatorSubscriptionCollection
        );

        _mfoniPackageCollection = databaseConfig.Database.GetCollection<Models.MfoniPackage>(
            appConstants.Value.MfoniPackageCollection
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
        var mfoniCreatorPackage = await _mfoniPackageCollection.Find(package => package.Id == creatorSubscription.PackageTypeId)
            .FirstOrDefaultAsync();

        if (mfoniCreatorPackage is null)
        {
            throw new HttpRequestException("InvalidMfoniPackage");
        }

        bool canIPay = user.BookWallet >= mfoniCreatorPackage.Amount;
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
                    PackageTypeId = mfoniCreatorPackage.Id,
                    StartedAt = DateTime.UtcNow,
                    EndedAt = nextRenewalDate,
                    Period = 1, // 1 Month
                };

                await _creatorSubscriptionCollection.InsertOneAsync(newSubscription);

                await this.SubscribeWithWallet(new SubscribeWithWalletInput
                {
                    Amount = mfoniCreatorPackage.Amount,
                    SubscriptionId = newSubscription.Id,
                    UserId = user.Id
                });

                // send them a notification that their subscription has been renewed.
                SendNotification(
                    user,
                    EmailTemplates.SuccessfulSubscriptionRenewalSubject,
                    EmailTemplates.SuccessfulSubscriptionRenewalBody
                        .Replace("{name}", user.Name)
                        .Replace("{package}", mfoniCreatorPackage.Name)
                        .Replace("{renewalDate}", today.ToString("dd/MM/yyyy"))
                        .Replace("{nextRenewalDate}", nextRenewalDate.ToString("dd/MM/yyyy"))
                        .Replace("{renewalAmount}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(mfoniCreatorPackage.Amount):0.00}")
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
                        .Replace("{package}", mfoniCreatorPackage.Name)
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
                            .Replace("{package}", mfoniCreatorPackage.Name)
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
                            .Replace("{package}", mfoniCreatorPackage.Name)
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
        await _walletService.Withdraw(new WalletWithdrawInput
        {
            Amount = input.Amount,
            UserId = "SYSTEM",
            ReasonForTransfer = WalletTransactionReasonForTransfer.SUBSCRIPTION_REFUND,
        });

        // deposit to user
        var wallet = await _walletService.Deposit(new WalletDepositInput
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
        // get free package
        var mfoniCreatorPackage = await _mfoniPackageCollection.Find(package => package.Code == MfoniPackageCode.FREE)
            .FirstOrDefaultAsync();

        if (mfoniCreatorPackage is null)
        {
            throw new HttpRequestException("InvalidFreeMfoniPackage");
        }

        var freeTierSubscription = new Models.CreatorSubscription
        {
            CreatorId = creatorId,
            PackageTypeId = mfoniCreatorPackage.Id,
            StartedAt = startDate is not null ? (DateTime)startDate : DateTime.UtcNow,
        };

        await _creatorSubscriptionCollection.InsertOneAsync(freeTierSubscription);

        return freeTierSubscription;
    }

    // get creators who are due for subscription renewal.
    public async Task<List<CreatorSubscription>> GetSubscribersDueForRenewal()
    {
        // get free package
        var mfoniCreatorPackage = await _mfoniPackageCollection.Find(package => package.Code == MfoniPackageCode.FREE)
            .FirstOrDefaultAsync();

        if (mfoniCreatorPackage is null)
        {
            throw new HttpRequestException("InvalidFreeMfoniPackage");
        }

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
                { "latestRecord.package_type_id", new BsonDocument("$ne", mfoniCreatorPackage.Id) },

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

        // get free package
        var mfoniCreatorPackage = await _mfoniPackageCollection.Find(package => package.Code == MfoniPackageCode.FREE)
            .FirstOrDefaultAsync();

        if (mfoniCreatorPackage is null)
        {
            throw new HttpRequestException("InvalidFreeMfoniPackage");
        }

        var filter = Builders<CreatorSubscription>.Filter.And(
            Builders<CreatorSubscription>.Filter.Eq("creator_id", ObjectId.Parse(sub.CreatorId)),
             Builders<CreatorSubscription>.Filter.And(
                Builders<CreatorSubscription>.Filter.Eq("package_type_id", mfoniCreatorPackage.Id),
                Builders<CreatorSubscription>.Filter.Gte("started_at", sub.EndedAt),
                Builders<CreatorSubscription>.Filter.Eq("ended_at", BsonNull.Value)
            )
        );


        var cancelledSubscription = await _creatorSubscriptionCollection.Find(filter).FirstOrDefaultAsync();

        return cancelledSubscription is null ? null : cancelledSubscription;
    }

    public async Task<CreatorSubscription?> IsSubscriptionPendingDowngrade(string creatorSubscriptionId)
    {
        var sub = await _creatorSubscriptionCollection.Find(sub => sub.Id == creatorSubscriptionId).FirstOrDefaultAsync();

        if (sub is null)
        {
            throw new HttpRequestException("CreatorSubscriptionNotFound");
        }

        // get free package
        var mfoniCreatorPackage = await _mfoniPackageCollection.Find(package => package.Code == MfoniPackageCode.FREE)
            .FirstOrDefaultAsync();

        if (mfoniCreatorPackage is null)
        {
            throw new HttpRequestException("InvalidFreeMfoniPackage");
        }

        var filter = Builders<CreatorSubscription>.Filter.And(
            Builders<CreatorSubscription>.Filter.Eq("creator_id", ObjectId.Parse(sub.CreatorId)),
             Builders<CreatorSubscription>.Filter.And(
                Builders<CreatorSubscription>.Filter.Ne("package_type_id", mfoniCreatorPackage.Id),
                Builders<CreatorSubscription>.Filter.Gt("started_at", DateTime.UtcNow)
            )
        );


        var pendingDowngradeSubscription = await _creatorSubscriptionCollection.Find(filter).FirstOrDefaultAsync();

        return pendingDowngradeSubscription is null ? null : pendingDowngradeSubscription;
    }

    public async Task<CreatorSubscription> GetActiveCreatorSubscription(string creatorId)
    {

        // get free package
        var mfoniCreatorPackage = await _mfoniPackageCollection.Find(package => package.Code == MfoniPackageCode.FREE)
            .FirstOrDefaultAsync();

        if (mfoniCreatorPackage is null)
        {
            throw new HttpRequestException("InvalidFreeMfoniPackage");
        }

        var today = DateTime.UtcNow;
        var filter = Builders<CreatorSubscription>.Filter.And(
            Builders<CreatorSubscription>.Filter.Eq("creator_id", ObjectId.Parse(creatorId)),
            Builders<CreatorSubscription>.Filter.Or(
                Builders<CreatorSubscription>.Filter.And(
                    Builders<CreatorSubscription>.Filter.Ne("package_type_id", mfoniCreatorPackage.Id),
                    Builders<CreatorSubscription>.Filter.Lte("started_at", today),
                    Builders<CreatorSubscription>.Filter.Gt("ended_at", today)
                ),
                Builders<CreatorSubscription>.Filter.And(
                    Builders<CreatorSubscription>.Filter.Eq("package_type_id", mfoniCreatorPackage.Id),
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

        // all active mfoni packages
        var mfoniCreatorPackages = await _mfoniPackageCollection.Find(package => package.Status == MfoniPackageStatus.ACTIVE)
            .ToListAsync();

        if (mfoniCreatorPackages is null || mfoniCreatorPackages.Count == 0)
        {
            throw new HttpRequestException("NoActiveMfoniPackages");
        }

        var freeCreatorPackage = mfoniCreatorPackages.Find(package => package.Code == MfoniPackageCode.FREE);
        if (freeCreatorPackage is null)
        {
            throw new HttpRequestException("NoFreeMfoniPackage");
        }

        var newPackageToSwitchTo = mfoniCreatorPackages.Find(package => package.Code == input.PricingPackage);
        if (newPackageToSwitchTo is null)
        {
            throw new HttpRequestException("InvalidMfoniPackage");
        }

        if (activeSubscription.PackageTypeId == freeCreatorPackage.Id)
        {

            var pricing = newPackageToSwitchTo.Amount * input.Period;
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
                PackageTypeId = newPackageToSwitchTo.Id,
                Period = input.Period,
                StartedAt = DateTime.UtcNow,
                EndedAt = nextRenewalDate,
            };

            await _creatorSubscriptionCollection.InsertOneAsync(creatorSubscription);

            await SubscribeWithWallet(new SubscribeWithWalletInput
            {
                Amount = pricing,
                SubscriptionId = creatorSubscription.Id,
                UserId = user.Id
            });

            // send them a notification that their subscription has been successful.
            SendNotification(
                user,
                EmailTemplates.SuccessfulSubscriptionSubject,
                EmailTemplates.SuccessfulSubscriptionBody
                    .Replace("{name}", user.Name)
                    .Replace("{package}", newPackageToSwitchTo.Name)
                    .Replace("{startDate}", today.ToString("dd/MM/yyyy"))
                    .Replace("{renewalDate}", nextRenewalDate.ToString("dd/MM/yyyy"))
                    .Replace("{renewalAmount}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(pricing):0.00}")
            );

            _ = _cacheProvider.EntityChanged(new[] {
                $"{CacheProvider.CacheEntities["auth"]}*{user.Id}*",
            });

            return creatorSubscription;
        }

        var activeSubPackage = mfoniCreatorPackages.Find(package => package.Id == activeSubscription.PackageTypeId);
        if (activeSubPackage is null)
        {
            throw new HttpRequestException("ActiveSubscriptionMfoniPackageNotFound");
        }

        var pricingChange = PricingLib.DetermineIfItsAnUpgradeOrDowngrade(activeSubPackage.Code, input.PricingPackage);

        if (pricingChange == "NO_CHANGE")
        {
            // make sure the subscription wasn't cancelled.
            var cancelledSubscriptionRecord = await IsSubscriptionCancelled(activeSubscription.Id);

            if (cancelledSubscriptionRecord is not null)
            {
                await _creatorSubscriptionCollection.DeleteOneAsync(subscription => subscription.Id == cancelledSubscriptionRecord.Id);

                _ = _cacheProvider.EntityChanged(new[] {
                    $"{CacheProvider.CacheEntities["auth"]}*{user.Id}*",
                });
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
                int daysSubscribedFor = (activeSubscription.EndedAt?.Date - activeSubscription.StartedAt.Date)?.Days ?? 0;
                int daysUsed = (today.Date - activeSubscription.StartedAt.Date).Days;
                var pricingForWhatsBeenUsed = PricingLib.GetPricePerDay(activeSubPackage.Amount) * daysUsed;
                var pricingForTotal = PricingLib.GetPricePerDay(activeSubPackage.Amount) * daysSubscribedFor;
                Int64 remainingAmount = (Int64)(pricingForTotal - pricingForWhatsBeenUsed);

                // calculate the balance
                var newUpgradeSubEndDate = DateTime.UtcNow.AddDays(input.Period * 30);

                Int64 pricingForWhatToPayFor = (Int64)(newPackageToSwitchTo.Amount * input.Period);

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
                    PackageTypeId = newPackageToSwitchTo.Id,
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
                        .Replace("{package}", newPackageToSwitchTo.Name),
                    EmailTemplates.SuccessfulSubscriptionImmediateUpgradeBody
                        .Replace("{name}", user.Name)
                        .Replace("{package}", newPackageToSwitchTo.Name)
                        .Replace("{upgradeAmount}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(pricingForWhatToPayFor):0.00}")
                        .Replace("{effectiveDate}", today.ToString("dd/MM/yyyy"))
                        .Replace("{renewalDate}", newUpgradeSubEndDate.ToString("dd/MM/yyyy"))
                );

                _ = _cacheProvider.EntityChanged(new[] {
                    $"{CacheProvider.CacheEntities["auth"]}*{user.Id}*",
                });

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
                    PackageTypeId = newPackageToSwitchTo.Id,
                    Period = 0.1,
                    StartedAt = newUpgradeSubStartDate,
                    EndedAt = upgradeDeferNextRenewalDate,
                };
                await _creatorSubscriptionCollection.InsertOneAsync(newUpgradeSub);

                SendNotification(
                    user,
                    EmailTemplates.SuccessfulSubscriptionScheduledUpgradeSubject
                        .Replace("{package}", newPackageToSwitchTo.Name),
                    EmailTemplates.SuccessfulSubscriptionScheduledUpgradeBody
                        .Replace("{name}", user.Name)
                        .Replace("{package}", newPackageToSwitchTo.Name)
                        .Replace("{nextRenewalDate}", upgradeDeferNextRenewalDate.ToString("dd/MM/yyyy"))
                        .Replace("{newMonthlyFee}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(newPackageToSwitchTo.Amount):0.00}")
                );

                _ = _cacheProvider.EntityChanged(new[] {
                    $"{CacheProvider.CacheEntities["auth"]}*{user.Id}*",
                });

                return newUpgradeSub;
            }

            throw new HttpRequestException("InvalidUpgradeEffect");
        }

        // ======================= DOWNGRADE THE SUBSCRIPTION. =============================

        var newDowngradeSubStartDate = (DateTime)activeSubscription.EndedAt!;
        var downgradeNextRenewalDate = newDowngradeSubStartDate.AddDays(1);

        // this will help cron job to know what new subscription to renew.
        var newDowngradeSub = new CreatorSubscription
        {
            CreatorId = creator.Id,
            PackageTypeId = activeSubPackage.Id,
            Period = 0.1,
            StartedAt = newDowngradeSubStartDate,
            EndedAt = downgradeNextRenewalDate,
        };
        await _creatorSubscriptionCollection.InsertOneAsync(newDowngradeSub);

        SendNotification(
            user,
            EmailTemplates.SuccessfulSubscriptionScheduledDowngradeSubject
                .Replace("{package}", newPackageToSwitchTo.Name),
            EmailTemplates.SuccessfulSubscriptionScheduledDowngradeBody
                .Replace("{name}", user.Name)
                .Replace("{package}", newPackageToSwitchTo.Name)
                .Replace("{currentPackage}", activeSubPackage.Name)
                .Replace("{currentCycleEndDate}", newDowngradeSubStartDate.ToString("dd/MM/yyyy"))
                .Replace("{nextRenewalDate}", downgradeNextRenewalDate.ToString("dd/MM/yyyy"))
                .Replace("{newMonthlyFee}", $"{MoneyLib.ConvertPesewasToCedis(newPackageToSwitchTo.Amount):0.00}")
        );

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["auth"]}*{user.Id}*",
        });

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
        var mfoniCreatorPackage = await _mfoniPackageCollection.Find(package => package.Id == lastSubscription.PackageTypeId)
            .FirstOrDefaultAsync();

        if (mfoniCreatorPackage is null)
        {
            throw new HttpRequestException("InvalidMfoniPackage");
        }

        if (mfoniCreatorPackage.Code == MfoniPackageCode.FREE)
        {
            throw new HttpRequestException("AlreadyOnFreeTier");
        }

        if (lastSubscription.EndedAt is null)
        {
            throw new HttpRequestException("SubscriptionEndDateNotFound");
        }

        // if its an upcoming subscription, then we delete it before we create the FREE
        if (lastSubscription.StartedAt > DateTime.UtcNow)
        {
            await _creatorSubscriptionCollection.DeleteOneAsync(subscription => subscription.Id == lastSubscription.Id);
        }

        // if it's premium, then we cancel it by creating a new subscription record with FREE as the package type.
        var newSubscription = await CreateAFreeTierSubscription(creatorId, lastSubscription.EndedAt);

        DateTime expiryDate = (DateTime)lastSubscription.EndedAt;

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["auth"]}*{user.Id}*",
        });

        SendNotification(
            user,
            EmailTemplates.CreatorSubscriptionCancelledSubject
                .Replace("{expiryDate}", expiryDate.ToString("dd/MM/yyyy")),
            EmailTemplates.CreatorSubscriptionCancelledBody
                .Replace("{name}", user.Name)
                .Replace("{package}", mfoniCreatorPackage.Name)
                .Replace("{cancellationDate}", DateTime.UtcNow.ToString("dd/MM/yyyy"))
                .Replace("{expiryDate}", expiryDate.ToString("dd/MM/yyyy"))
        );

        return newSubscription;
    }


    public async Task<bool> DeletePendingSubscription(string subscriptionId)
    {
        await _creatorSubscriptionCollection.DeleteOneAsync(subscription => subscription.Id == subscriptionId);
        return true;
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
        var packageTypeFilter = builder.Eq(sub => sub.PackageTypeId, input.PackageTypeId);


        var filters = Builders<CreatorSubscription>.Filter.And(userIdFilter);

        if (input.PackageTypeId is not null)
        {
            filters = Builders<CreatorSubscription>.Filter.And(userIdFilter, packageTypeFilter);
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
        var userIdFilter = builder.Eq(sub => sub.CreatorId, input.CreatorId);
        var packageTypeFilter = builder.Eq(sub => sub.PackageTypeId, input.PackageTypeId);


        var filters = Builders<CreatorSubscription>.Filter.And(userIdFilter);

        if (input.PackageTypeId is not null)
        {
            filters = Builders<CreatorSubscription>.Filter.And(userIdFilter, packageTypeFilter);
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