using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using NanoidDotNet;
using main.Configurations;
using Microsoft.Extensions.Caching.Distributed;

namespace main.Domains;

public class UserService
{
    private readonly ILogger<UserService> _logger;
    private readonly IMongoCollection<Models.User> _userCollection;
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
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;

        logger.LogDebug("User service initialized");
    }

    public async Task<bool> SavePhoneNumber(string phoneNumber, string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new Exception("UserNotFound");
        }

        var filter = Builders<Models.User>.Filter.Eq(u => u.Id, userId);
        var updates = Builders<Models.User>.Update
            .Set(r => r.PhoneNumber, phoneNumber);

        await _userCollection.UpdateOneAsync(filter, updates);

        var code = Nanoid.Generate("1234567890", 5);
        await _cacheProvider.SetCache($"verify-{user.Id}", code, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        });

        await SmsConfiguration.SendSms(new SendSmsInput
        {
            PhoneNumber = phoneNumber,
            Message = $"Hello {user.Name},\\n\\nYour OTP is {code}. Please use this code to complete your action.\\n\\nThank you.",
            AppId = _appConstantsConfiguration.SmsAppId,
            AppSecret = _appConstantsConfiguration.SmsAppSecret
        });

        return true;
    }

    public async Task<bool> VerifyPhoneNumber(string code, string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user.VerifiedPhoneNumberAt is not null)
        {
            throw new Exception("Phone number has already been verified");
        }

        var verificationCode = await _cacheProvider.GetFromCache<string>($"verify-{user.Id}");
        if (code != verificationCode) {
            throw new Exception("CodeIsInCorrectOrHasExpired");
        }

        var filter = Builders<Models.User>.Filter.Eq(r => r.Id, user.Id);
        var updates = Builders<Models.User>.Update.Set(v => v.VerifiedPhoneNumberAt, DateTime.Now);
        await _userCollection.UpdateOneAsync(filter, updates);

        await _cacheProvider.ClearCache($"verify-{user.Id}");
        return true;
    }
}

