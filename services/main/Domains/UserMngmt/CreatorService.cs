using main.Configurations;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using NanoidDotNet;

namespace main.Domains;

public class CreatorService
{
    private readonly ILogger<UserService> _logger;
    private readonly IMongoCollection<Models.Creator> __creatorCollection;
    private readonly IMongoCollection<Models.CreatorSubscription> __creatorSubscriptionCollection;
    private readonly IMongoCollection<Models.CreatorApplication> _creatorApplicationCollection;
    private readonly UserService _userService;
    private readonly AppConstants _appConstantsConfiguration;

    public CreatorService(
       ILogger<UserService> logger,
       DatabaseSettings databaseConfig,
       IOptions<AppConstants> appConstants,
        UserService userService
   )
    {
        _logger = logger;
        __creatorCollection = databaseConfig.Database.GetCollection<Models.Creator>(
            appConstants.Value.CreatorCollection
        );
        __creatorSubscriptionCollection = databaseConfig.Database.GetCollection<Models.CreatorSubscription>(
           appConstants.Value.CreatorPackageCollection
       );

        _creatorApplicationCollection =
             databaseConfig.Database.GetCollection<Models.CreatorApplication>(
                 appConstants.Value.CreatorApplicatonCollection
             );

        _userService = userService;
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

        var user = await _userService.GetUserById(creatorApplication.UserId);

        var creator = new Creator
        {
            CreatorApplicationId = creatorApplication.Id,
            UserId = creatorApplication.UserId,
            Username = $"{user.Name.ToLower().Replace(" ", "")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 5)}",
            PricingPackage = creatorApplication.IntendedPricingPackage!, // should be available before application is submitted
        };

        await __creatorCollection.InsertOneAsync(creator);

        var pricingLib = new PricingLib(creatorApplication.IntendedPricingPackage!);
        bool isItAPremiumPackage = creatorApplication.IntendedPricingPackage != CreatorSubscriptionPackageType.FREE;
        bool canIPayWithWallet = user.BookWallet >= pricingLib.GetPrice();

        // Create a trail of the package the creator has activated.
        var creatorSubscription = new CreatorSubscription
        {
            CreatorId = creator.Id,
            PackageType = creatorApplication.IntendedPricingPackage!,
            Period = isItAPremiumPackage ? canIPayWithWallet ? 1 : 0.1 : null,
            StartedAt = DateTime.UtcNow,
            EndedAt = isItAPremiumPackage ? canIPayWithWallet ? DateTime.UtcNow.AddMonths(1) : DateTime.UtcNow.AddDays(1) : null,
        };

        await __creatorSubscriptionCollection.InsertOneAsync(creatorSubscription);

        if (isItAPremiumPackage)
        {
            if (canIPayWithWallet)
            {
                // substract money from user's wallet
                // TODO: call Wallet service to do the needful.
            }
            else
            {
                if (user.PhoneNumber is not null && user.PhoneNumberVerifiedAt is not null)
                {
                    var _ = SmsConfiguration.SendSms(new SendSmsInput
                    {
                        PhoneNumber = user.PhoneNumber,
                        Message = EmailTemplates.NewCreatorWithPremiumPackageButLowWalletBody.Replace("{name}", user.Name),
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
                        Subject = EmailTemplates.NewCreatorWithPremiumPackageButLowWalletSubject,
                        Message = EmailTemplates.NewCreatorWithPremiumPackageButLowWalletBody.Replace("{name}", user.Name),
                        ApiKey = _appConstantsConfiguration.ResendApiKey
                    });
                }
            }
        }

        return creator;
    }

}