using main.Configurations;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using NanoidDotNet;

namespace main.Domains;

public class CreatorService
{
    private readonly ILogger<CreatorService> _logger;
    private readonly IMongoCollection<Models.Creator> __creatorCollection;
    private readonly IMongoCollection<Models.CreatorSubscription> __creatorSubscriptionCollection;
    private readonly IMongoCollection<Models.CreatorApplication> _creatorApplicationCollection;
    private readonly UserService _userService;
    private readonly SubscriptionService _subscriptionService;
    private readonly AppConstants _appConstantsConfiguration;

    public CreatorService(
       ILogger<CreatorService> logger,
       DatabaseSettings databaseConfig,
       IOptions<AppConstants> appConstants,
        UserService userService,
        SubscriptionService subscriptionService
   )
    {
        _logger = logger;
        __creatorCollection = databaseConfig.Database.GetCollection<Models.Creator>(
            appConstants.Value.CreatorCollection
        );
        __creatorSubscriptionCollection = databaseConfig.Database.GetCollection<Models.CreatorSubscription>(
           appConstants.Value.CreatorSubscriptionCollection
       );

        _creatorApplicationCollection =
             databaseConfig.Database.GetCollection<Models.CreatorApplication>(
                 appConstants.Value.CreatorApplicatonCollection
             );

        _userService = userService;
        _subscriptionService = subscriptionService;
        _appConstantsConfiguration = appConstants.Value;

        logger.LogDebug("Creator service initialized");
    }

    public async Task<Creator> Create(string creatorApplicationId)
    {
        var creatorApplication = await _creatorApplicationCollection.Find(application => application.Id == creatorApplicationId).FirstOrDefaultAsync();
        if (creatorApplication is null)
        {
            throw new HttpRequestException("CreatorApplicationNotFound");
        }

        if (creatorApplication.IntendedPricingPackage is null)
        {
            throw new HttpRequestException("IntendedPricingPackageNotSet");
        }

        var user = await _userService.GetUserById(creatorApplication.UserId);

        var creator = new Creator
        {
            CreatorApplicationId = creatorApplication.Id,
            UserId = creatorApplication.UserId,
            Username = $"{user.Name.ToLower().Replace(" ", "")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 5)}",
        };

        await __creatorCollection.InsertOneAsync(creator);

        var pricingLib = new PricingLib(creatorApplication.IntendedPricingPackage);
        bool isItAPremiumPackage = creatorApplication.IntendedPricingPackage != CreatorSubscriptionPackageType.FREE;
        bool canIPayWithWallet = user.BookWallet >= pricingLib.GetPrice();

        // Create a trail of the package the creator has been activated.
        var creatorSubscription = new CreatorSubscription
        {
            CreatorId = creator.Id,
            PackageType = creatorApplication.IntendedPricingPackage,
            Period = isItAPremiumPackage ? canIPayWithWallet ? 1 : 0.5 : null,
            StartedAt = DateTime.UtcNow,
            EndedAt = isItAPremiumPackage ? canIPayWithWallet ? DateTime.UtcNow.AddMonths(1) : DateTime.UtcNow.AddDays(5) : null,
        };

        await __creatorSubscriptionCollection.InsertOneAsync(creatorSubscription);

        if (isItAPremiumPackage)
        {
            if (canIPayWithWallet)
            {
                // subscribe with wallet
                await _subscriptionService.SubscribeWithWallet(new SubscribeWithWalletInput
                {
                    Amount = pricingLib.GetPrice(),
                    SubscriptionId = creatorSubscription.Id,
                    UserId = user.Id,
                });

            }
            else
            {

                SendNotification(
                    user,
                    EmailTemplates.NewCreatorWithPremiumPackageButLowWalletSubject,
                    EmailTemplates.NewCreatorWithPremiumPackageButLowWalletBody.Replace("{name}", user.Name)
                );
            }
        }

        return creator;
    }

    public async Task<CreatorSubscription> ActivateCreatorSubscription(ActivateCreatorSubscriptionInput input)
    {
        var creator = await __creatorCollection.Find(creator => creator.Id == input.CreatorId).FirstOrDefaultAsync();
        var user = await _userService.GetUserById(creator.UserId);

        var pricingLib = new PricingLib(input.PricingPackage);
        var pricing = pricingLib.GetPrice() * input.Period;
        bool canIPayWithWallet = user.BookWallet >= pricing;

        if (!canIPayWithWallet)
        {
            throw new HttpRequestException("InsufficientFundsInWallet");
        }

        var today = DateTime.UtcNow;
        var nextRenewalDate = DateTime.UtcNow.AddMonths(input.Period);

        // Create a trail of the package the creator has been activated.
        var creatorSubscription = new CreatorSubscription
        {
            CreatorId = creator.Id,
            PackageType = input.PricingPackage,
            Period = input.Period,
            StartedAt = DateTime.UtcNow,
            EndedAt = nextRenewalDate,
        };

        await __creatorSubscriptionCollection.InsertOneAsync(creatorSubscription);

        await _subscriptionService.SubscribeWithWallet(new SubscribeWithWalletInput
        {
            Amount = pricingLib.GetPrice(),
            SubscriptionId = creatorSubscription.Id,
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
                .Replace("{renewalAmount}", MoneyLib.ConvertPesewasToCedis(pricing) + ".00")
        );

        return creatorSubscription;
    }


    public async Task<CreatorSubscription> CancelCreatorSubscription(string creatorId)
    {
        // find last subscription of creator based on date created
        var lastSubscription = await __creatorSubscriptionCollection.Find(subscription => subscription.CreatorId == creatorId)
            .SortByDescending(subscription => subscription.CreatedAt)
            .FirstOrDefaultAsync();

        // if it's free, then we don't do anything.
        if (lastSubscription.PackageType == CreatorSubscriptionPackageType.FREE)
        {
            return lastSubscription;
        }

        // if it's premium, then we cancel it by creating a new subscription record with FREE as the package type.
        var newSubscription = await _subscriptionService.CreateAFreeTierSubscription(creatorId);
        return newSubscription;
    }

    public async Task<CreatorSubscription> GetActiveCreatorSubscription(string creatorId)
    {

        // find last subscription of creator based on date created.
        var lastSubscription = await __creatorSubscriptionCollection.Find(subscription => subscription.CreatorId == creatorId)
            .SortByDescending(subscription => subscription.CreatedAt)
            .Limit(2)
            .ToListAsync();

        if (lastSubscription.Count == 0)
        {
            throw new Exception("CreatorSubscriptionNotFound");
        }

        // if last subscription is free, then we verify it's active or not.
        if (lastSubscription[0].PackageType == CreatorSubscriptionPackageType.FREE)
        {
            if (lastSubscription[0].StartedAt >= DateTime.Today)
            {
                return lastSubscription[0];
            }

            return lastSubscription[1];
        }

        // if it's not free, then we know the last subcription record is the active one.
        return lastSubscription[0];
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
                { "$expr", new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$gte", new BsonArray
                        {
                            new BsonDateTime(DateTime.UtcNow),
                            new BsonDocument("$subtract", new BsonArray
                            {
                                "$latestRecord.end_date",
                                5 * 24 * 60 * 60 * 1000 // 5 days in milliseconds
                            })
                        })
                    })
                }
            }),

            // Replace the root with the latestRecord
            new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$latestRecord"))
        };

        return await __creatorSubscriptionCollection
            .Aggregate<CreatorSubscription>(pipeline)
            .ToListAsync();
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