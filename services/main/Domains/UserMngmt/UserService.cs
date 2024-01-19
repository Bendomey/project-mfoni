using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using NanoidDotNet;
using main.Configurations;

namespace main.Domains.UserMngmt;

public class UserService
{
    private readonly ILogger<UserService> logger;
    private readonly IMongoCollection<Models.User> userCollection;

    public UserService(
        ILogger<UserService> logger,
        IOptions<DatabaseSettings> mfoniStoreDatabaseSettings,
        IOptions<AppConstants> appConstants)
    {
        this.logger = logger;
        var database = DatabaseSettings.connectToDatabase(mfoniStoreDatabaseSettings);
        userCollection = database.GetCollection<Models.User>(appConstants.Value.UserCollection);

        logger.LogDebug("User service initialized");
    }

    public async Task<bool> SavePhoneNumber(string phoneNumber, string userId)
    {
        var user = await userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new Exception($"User with Id: {userId} not found");
        }

        var phoneNumberToUpdate = Builders<Models.User>.Update.Set(x => x.PhoneNumber, phoneNumber);
        _ = await userCollection.UpdateOneAsync(user.Id, phoneNumberToUpdate);

        var phoneNumberId = Nanoid.Generate("1234567890", 5);
        var redisDb = RedisDataBaseConfiguration.RedisDbConfig();
        redisDb.StringSet(user.Id.ToString(), phoneNumberId, TimeSpan.FromHours(1));

        _ = SmsConfiguration.SendSms(phoneNumber, $"Your number {phoneNumber} has been saved");

        return true;
    }
}

