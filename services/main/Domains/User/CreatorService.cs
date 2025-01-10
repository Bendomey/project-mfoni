using Amazon.S3.Model;
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

    public async Task<Models.Creator> GetCreatorByUserId(string userId)
    {
        var creator = await __creatorCollection.Find(creator => creator.UserId == userId).FirstOrDefaultAsync();
        if (creator is null)
        {
            throw new HttpRequestException("CreatorNotFound");
        }

        return creator;
    }

    public async Task<Models.Creator> GetCreatorByUsername(string username)
    {
        var creator = await __creatorCollection.Find(creator => creator.Username == username).FirstOrDefaultAsync();
        if (creator is null)
        {
            throw new HttpRequestException("CreatorNotFound");
        }

        return creator;
    }

    public async Task<List<Models.Creator>> GetRelatedCreators(string username)
    {
        var filters = FilterDefinition<Models.Creator>.Empty;
        filters &= Builders<Models.Creator>.Filter.Ne(creator => creator.Username, username);
        filters &= Builders<Models.Creator>.Filter.Eq(creator => creator.Status, CreatorStatus.ACTIVE);
        filters &= Builders<Models.Creator>.Filter.Eq(creator => creator.WebsiteDisabledAt, null);

        var creators = await __creatorCollection.Find(filters).ToListAsync();
        return creators;
    }

    public async Task<long> GetRelatedCreatorsCount(string username)
    {
        var filters = FilterDefinition<Models.Creator>.Empty;
        filters &= Builders<Models.Creator>.Filter.Ne(creator => creator.Username, username);
        filters &= Builders<Models.Creator>.Filter.Eq(creator => creator.Status, CreatorStatus.ACTIVE);
        filters &= Builders<Models.Creator>.Filter.Eq(creator => creator.WebsiteDisabledAt, null);

        var creatorsCount = await __creatorCollection.CountDocumentsAsync(filters);
        return creatorsCount;
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
            Period = isItAPremiumPackage ? canIPayWithWallet ? 1 : 0 : null,
            StartedAt = DateTime.UtcNow,
            EndedAt = isItAPremiumPackage ? canIPayWithWallet ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow : null,
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

    public async Task<Models.Creator> GetCreatorById(string creatorId)
    {
        var creator = await __creatorCollection.Find(creator => creator.Id == creatorId).FirstOrDefaultAsync();
        if (creator is null)
        {
            throw new HttpRequestException("CreatorNotFound");
        }

        return creator;
    }

    public async Task<GetUserInfoResponse> GetUserInfo(string userId)
    {
        var user = await _userService.GetUserById(userId);
        var creator = await GetCreatorByUserId(userId);
        var creatorSubscription = await _subscriptionService.GetActiveCreatorSubscription(creator.Id);

        return new GetUserInfoResponse
        {
            User = user,
            Creator = creator,
            CreatorSubscription = creatorSubscription
        };
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