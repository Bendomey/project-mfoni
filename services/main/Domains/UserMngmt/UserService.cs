using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using NanoidDotNet;
using main.Configurations;
using Microsoft.Extensions.Caching.Distributed;
using main.DTOs;
using main.Models;
using main.Lib;

namespace main.Domains;

public class UserService
{
    private readonly ILogger<UserService> _logger;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly IMongoCollection<Models.CreatorApplication> _creatorApplicationCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;


    public UserService(
        ILogger<UserService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider
    )
    {
        _logger = logger;
        _userCollection = databaseConfig.Database.GetCollection<Models.User>(appConstants.Value.UserCollection);
        _creatorApplicationCollection = databaseConfig.Database.GetCollection<Models.CreatorApplication>(appConstants.Value.CreatorApplicatonCollection);
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;

        logger.LogDebug("User service initialized");
    }

    public bool SetupAccount(SetupAccountInput accountInput, CurrentUserOutput userInput)
    {
        var user = _userCollection.Find<Models.User>(user => user.Id == userInput.Id).FirstOrDefault();

        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        user.Role = UserRole.CLIENT;
        user.Name = accountInput.Name;
        user.UpdatedAt = DateTime.UtcNow;

        if (accountInput.Role == UserRole.CREATOR)
        {
            var __newCreatorApplication = new Models.CreatorApplication
            {
                UserId = user.Id,
                IntendedPricingPackage = accountInput.IntendedPricingPackage,
            };
            _creatorApplicationCollection.InsertOne(__newCreatorApplication);
        }

        _userCollection.ReplaceOne(user => user.Id == userInput.Id, user);
        return true;
    }

    public async Task<bool> SavePhoneNumber(string phoneNumber, string userId)
    {
        var normalizedPhoneNumber = StringLib.NormalizePhoneNumber(phoneNumber);

        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        // verify if phone number has been taken already
        var userExistsWithPhoneNumber = await _userCollection.Find(user => user.PhoneNumber == normalizedPhoneNumber).FirstOrDefaultAsync();
        if (userExistsWithPhoneNumber != null && userExistsWithPhoneNumber.Id != userId)
        {
            throw new HttpRequestException("PhoneNumberAlreadyExists");
        }

        var filter = Builders<Models.User>.Filter.Eq(u => u.Id, userId);
        var updates = Builders<Models.User>.Update
            .Set(r => r.PhoneNumber, normalizedPhoneNumber);

        if (normalizedPhoneNumber != user.PhoneNumber)
        {
            updates = updates.Set(r => r.PhoneNumberVerifiedAt, null);
        }

        await _userCollection.UpdateOneAsync(filter, updates);

        var code = "12345";
        // TODO: look into redis problem in staging.
        // var code = Nanoid.Generate("1234567890", 5);
        // await _cacheProvider.SetCache($"verify-{user.Id}", code, new DistributedCacheEntryOptions
        // {
        //     AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        // });

        await SmsConfiguration.SendSms(new SendSmsInput
        {
            PhoneNumber = normalizedPhoneNumber,
            Message = EmailTemplates.VerifyPhoneNumberBody.Replace("{code}", code).Replace("{name}", user.Name),
            AppId = _appConstantsConfiguration.SmsAppId,
            AppSecret = _appConstantsConfiguration.SmsAppSecret
        });

        return true;
    }

    public async Task<bool> VerifyPhoneNumber(string code, string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        if (user.PhoneNumberVerifiedAt is not null)
        {
            throw new HttpRequestException("PhoneNumberAlreadyVerified");
        }

        // var verificationCode = await _cacheProvider.GetFromCache<string>($"verify-{user.Id}");
        // if (code != verificationCode)
        if (code != "12345")
        {
            throw new HttpRequestException("CodeIsIncorrectOrHasExpired");
        }

        var filter = Builders<Models.User>.Filter.Eq(r => r.Id, user.Id);
        var updates = Builders<Models.User>.Update.Set(v => v.PhoneNumberVerifiedAt, DateTime.Now);
        await _userCollection.UpdateOneAsync(filter, updates);

        // await _cacheProvider.ClearCache($"verify-{user.Id}");
        return true;
    }

    public async Task<bool> SaveEmailAddress(string emailAddress, string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        // verify if phone number has been taken already
        var userExistsWithEmailAddress = await _userCollection.Find(user => user.Email == emailAddress).FirstOrDefaultAsync();
        if (userExistsWithEmailAddress != null && userExistsWithEmailAddress.Id != userId)
        {
            throw new HttpRequestException("EmailAlreadyExists");
        }

        var filter = Builders<Models.User>.Filter.Eq(u => u.Id, userId);
        var updates = Builders<Models.User>.Update
            .Set(r => r.Email, emailAddress);

        if (emailAddress != user.Email)
        {
            updates = updates.Set(r => r.EmailVerifiedAt, null);
        }

        await _userCollection.UpdateOneAsync(filter, updates);

        var code = "12345";
        // TODO: look into redis problem in staging.
        // var code = Nanoid.Generate("1234567890", 5);
        // await _cacheProvider.SetCache($"verify-{user.Id}", code, new DistributedCacheEntryOptions
        // {
        //     AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        // });

        var _ = EmailConfiguration.Send(
            new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = emailAddress,
                Subject = EmailTemplates.VerifyAccountSubject,
                Message = EmailTemplates.VerifyPhoneNumberBody.Replace("{code}", code).Replace("{name}", user.Name),
                ApiKey = _appConstantsConfiguration.ResendApiKey
            }
        );

        return true;
    }

    public async Task<bool> VerifyEmailAddress(string code, string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        if (user.EmailVerifiedAt is not null)
        {
            throw new HttpRequestException("EmailAddressAlreadyVerified");
        }

        // var verificationCode = await _cacheProvider.GetFromCache<string>($"verify-{user.Id}");
        // if (code != verificationCode)
        if (code != "12345")
        {
            throw new HttpRequestException("CodeIsIncorrectOrHasExpired");
        }

        var filter = Builders<Models.User>.Filter.Eq(r => r.Id, user.Id);
        var updates = Builders<Models.User>.Update.Set(v => v.EmailVerifiedAt, DateTime.Now);
        await _userCollection.UpdateOneAsync(filter, updates);

        // await _cacheProvider.ClearCache($"verify-{user.Id}");
        return true;
    }



    public async Task<CreatorApplication> SubmitCreatorApplication(SubmitCreatorApplicationInput input, string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        var filterByUserId = Builders<CreatorApplication>.Filter.Eq(creatorApplication => creatorApplication.UserId, userId);
        var filterByStatus = Builders<CreatorApplication>.Filter.Eq(creatorApplication => creatorApplication.Status, CreatorApplicationStatus.PENDING);

        // Combine filters using AND
        var combinedFilter = Builders<CreatorApplication>.Filter.And(filterByUserId, filterByStatus);

        var creatorApplication = await _creatorApplicationCollection.Find(combinedFilter).FirstOrDefaultAsync();
        if (creatorApplication is null)
        {
            throw new HttpRequestException("CreatorApplicationNotFound");
        }

        var idFilter = Builders<CreatorApplication>.Filter.Eq(r => r.Id, creatorApplication.Id);
        var userUpdates = Builders<CreatorApplication>.Update
            .Set(r => r.IdType, input.IdType)
            .Set(r => r.IdNumber, input.IdNumber)
            .Set(r => r.IdFrontImage, input.IdFrontImage)
            .Set(r => r.IdBackImage, input.IdBackImage)
            .Set(r => r.Status, CreatorApplicationStatus.SUBMITTED)
            .Set(r => r.SubmittedAt, DateTime.UtcNow)
            .Set(r => r.UpdatedAt, DateTime.UtcNow);

        await _creatorApplicationCollection.UpdateOneAsync(idFilter, userUpdates);

        return creatorApplication;
    }
}

