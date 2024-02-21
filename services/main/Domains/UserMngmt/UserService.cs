using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using NanoidDotNet;
using main.Configurations;
using Microsoft.Extensions.Caching.Distributed;
using main.DTOs;
using main.Models;

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

    public async Task<bool> SavePhoneNumber(string phoneNumber, string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        // verify if phone number has been taken already
        var userExistsWithPhoneNumber = await _userCollection.Find(user => user.PhoneNumber == phoneNumber).FirstOrDefaultAsync();
        if (userExistsWithPhoneNumber != null && userExistsWithPhoneNumber.Id != userId)
        {
            throw new HttpRequestException("PhoneNumberAlreadyExists");
        }

        var filter = Builders<Models.User>.Filter.Eq(u => u.Id, userId);
        var updates = Builders<Models.User>.Update
            .Set(r => r.PhoneNumber, phoneNumber);

        if (phoneNumber != user.PhoneNumber)
        {
            updates = updates.Set(r => r.VerifiedPhoneNumberAt, null);
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
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        if (user.VerifiedPhoneNumberAt is not null)
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
        var updates = Builders<Models.User>.Update.Set(v => v.VerifiedPhoneNumberAt, DateTime.Now);
        await _userCollection.UpdateOneAsync(filter, updates);

        // await _cacheProvider.ClearCache($"verify-{user.Id}");
        return true;
    }

    public async Task VerifyIdentity(IdentityVerificationInput input)
    {
        // verify reference id
        var normalizedPhoneNumber = StringLib.NormalizePhoneNumber(input.ReferenceId);
        var user = await _userCollection.Find(user => user.PhoneNumber == normalizedPhoneNumber).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        var creatorApplication = await _creatorApplicationCollection.Find(creatorApplication => creatorApplication.Id == user.CreatorApplicationId).FirstOrDefaultAsync();
        if (creatorApplication is null)
        {
            throw new HttpRequestException("CreatorApplicationNotFound");
        }

        if (creatorApplication.Status != CreatorApplicationStatus.PENDING)
        {
            throw new HttpRequestException("CreatorApplicationNotPending");
        }

        // check the status of the identity response
        if (input.Status == IdentityVerificationInputStatus.FAILED)
        {
            // once its a failed status, we create a new creatorApplication for the applicant and reject it. We need to create records for all failed transactions.
            var __newCreatorApplication = new CreatorApplication
            {
                ApplicantId = user.Id,
                Status = CreatorApplicationStatus.REJECTED,
                IdentityProviderResponse = new IdentityProviderResponse
                {
                    TransactionNumber = input.TransactionNumber,
                    PictureMatchScore = input.PictureMatchScore,
                    LivenessVerificationScore = input.LivenessVerificationScore,
                    DateOfBirthMatchScore = input.DateOfBirthMatchScore,
                    NameMatchScore = input.NameMatchScore,
                    Image = input.Image,
                    OverAllComparismScore = input.OverAllComparismScore,
                    Status = input.Status,
                    ReferenceId = input.ReferenceId,
                    IdNumber = input.IdNumber,
                    VerificationResult = input.VerificationResult
                }
            };

            _creatorApplicationCollection.InsertOne(__newCreatorApplication);
        }
        else if (input.Status == IdentityVerificationInputStatus.SUCCESSFUL)
        {
            // if its successful, we update the creatorApplication status to approved
            var filter = Builders<CreatorApplication>.Filter.Eq(r => r.Id, creatorApplication.Id);
            var updates = Builders<CreatorApplication>.Update
                .Set(r => r.Status, CreatorApplicationStatus.APPROVED)
                .Set(r => r.ApprovedAt, DateTime.UtcNow)
                .Set(r => r.UpdatedAt, DateTime.UtcNow)
                .Set(r => r.IdentityProviderResponse, new IdentityProviderResponse
                {
                    TransactionNumber = input.TransactionNumber,
                    PictureMatchScore = input.PictureMatchScore,
                    LivenessVerificationScore = input.LivenessVerificationScore,
                    DateOfBirthMatchScore = input.DateOfBirthMatchScore,
                    NameMatchScore = input.NameMatchScore,
                    Image = input.Image,
                    OverAllComparismScore = input.OverAllComparismScore,
                    Status = input.Status,
                    ReferenceId = input.ReferenceId,
                    IdNumber = input.IdNumber,
                    VerificationResult = input.VerificationResult
                });
            await _creatorApplicationCollection.UpdateOneAsync(filter, updates);

            // update the user role to creator
            var userFilter = Builders<Models.User>.Filter.Eq(r => r.Id, user.Id);
            var userUpdates = Builders<Models.User>.Update
                .Set(r => r.UpdatedAt, DateTime.UtcNow)
                .Set(r => r.Role, UserRole.CREATOR);
            await _userCollection.UpdateOneAsync(userFilter, userUpdates);
        }
    }
}

