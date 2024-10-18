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

public class CreatorApplicationService
{
    private readonly ILogger<UserService> _logger;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly IMongoCollection<Models.Admin> _adminCollection;
    private readonly IMongoCollection<Models.CreatorApplication> _creatorApplicationCollection;
    private readonly IMongoCollection<Models.Creator> _creatorCollection;
    private readonly AppConstants _appConstantsConfiguration;

    public CreatorApplicationService(
        ILogger<UserService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants
    )
    {
        _logger = logger;
        _userCollection = databaseConfig.Database.GetCollection<Models.User>(appConstants.Value.UserCollection);
        _adminCollection = databaseConfig.Database.GetCollection<Models.Admin>(appConstants.Value.AdminCollection);
        _creatorApplicationCollection = databaseConfig.Database.GetCollection<Models.CreatorApplication>(appConstants.Value.CreatorApplicatonCollection);
        _creatorCollection = databaseConfig.Database.GetCollection<Models.Creator>(appConstants.Value.CreatorCollection);
        _appConstantsConfiguration = appConstants.Value;

        logger.LogDebug("User service initialized");
    }

    public async Task<CreatorApplication> SubmitCreatorApplication(SubmitCreatorApplicationInput input, string creatorApplicationId)
    {
        var filterByApplicationId = Builders<CreatorApplication>.Filter.Eq(creatorApplication => creatorApplication.Id, creatorApplicationId);

        var combinedFilter = Builders<CreatorApplication>.Filter.And(filterByApplicationId);

        var creatorApplication = await _creatorApplicationCollection.Find(combinedFilter).FirstOrDefaultAsync();
        if (creatorApplication is null)
        {
            throw new HttpRequestException("CreatorApplicationNotFound");
        }

        if (creatorApplication.Status != CreatorApplicationStatus.PENDING)
        {
            throw new HttpRequestException("CreatorApplicationAlready" + creatorApplication.Status.ToString());
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

        var user = await _userCollection.Find(user => user.Id == creatorApplication.UserId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        if (user.PhoneNumber is not null && user.PhoneNumberVerifiedAt is not null)
        {
            var _ = SmsConfiguration.SendSms(new SendSmsInput
            {
                PhoneNumber = user.PhoneNumber,
                Message = EmailTemplates.CreatorApplicationSubmittedBody.Replace("{name}", user.Name),
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
                Subject = EmailTemplates.CreatorApplicationSubmittedSubject,
                Message = EmailTemplates.CreatorApplicationSubmittedBody.Replace("{name}", user.Name),
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }

        return creatorApplication;
    }

    public async Task<Creator> ApproveCreatorApplication(ApproveCreatorApplicationInput input, string adminId)
    {
        var admin = await _adminCollection.Find(admin => admin.Id == adminId).FirstOrDefaultAsync();
        if (admin is null)
        {
            throw new HttpRequestException("AdminNotFound");
        }

        var creatorApplication = await _creatorApplicationCollection.Find(application => application.Id == input.CreatorApplicationId).FirstOrDefaultAsync();
        if (creatorApplication is null)
        {
            throw new HttpRequestException("CreatorApplicationNotFound");
        }

        var idFilter = Builders<CreatorApplication>.Filter.Eq(r => r.Id, input.CreatorApplicationId);
        var userUpdates = Builders<CreatorApplication>.Update
            .Set(r => r.Status, CreatorApplicationStatus.APPROVED)
            .Set(r => r.ApprovedAt, DateTime.UtcNow)
            .Set(r => r.ApprovedById, adminId)
            .Set(r => r.UpdatedAt, DateTime.UtcNow);

        await _creatorApplicationCollection.UpdateOneAsync(idFilter, userUpdates);

        var creator = new Creator
        {
            CreatorApplicationId = creatorApplication.Id,
            UserId = creatorApplication.UserId,
        };

        await _creatorCollection.InsertOneAsync(creator);

        var user = await _userCollection.Find(user => user.Id == creatorApplication.UserId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        if (user.PhoneNumber is not null && user.PhoneNumberVerifiedAt is not null)
        {
            var _ = SmsConfiguration.SendSms(new SendSmsInput
            {
                PhoneNumber = user.PhoneNumber,
                Message = EmailTemplates.CreatorApplicationApprovedBody.Replace("{name}", user.Name),
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
                Subject = EmailTemplates.CreatorApplicationApprovedBody,
                Message = EmailTemplates.CreatorApplicationApprovedBody.Replace("{name}", user.Name),
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }


        return creator;
    }

    public async Task<CreatorApplication> RejectCreatorApplication(RejectCreatorApplicationInput input, string adminId)
    {
        var admin = await _adminCollection.Find(admin => admin.Id == adminId).FirstOrDefaultAsync();
        if (admin is null)
        {
            throw new HttpRequestException("AdminNotFound");
        }

        var creatorApplication = await _creatorApplicationCollection.Find(application => application.Id == input.CreatorApplicationId).FirstOrDefaultAsync();
        if (creatorApplication is null)
        {
            throw new HttpRequestException("CreatorApplicationNotFound");
        }

        var idFilter = Builders<CreatorApplication>.Filter.Eq(r => r.Id, input.CreatorApplicationId);
        var userUpdates = Builders<CreatorApplication>.Update
            .Set(r => r.Status, CreatorApplicationStatus.REJECTED)
            .Set(r => r.RejectedAt, DateTime.UtcNow)
            .Set(r => r.RejectedById, adminId)
            .Set(r => r.RejectedReason, input.Reason)
            .Set(r => r.UpdatedAt, DateTime.UtcNow);

        await _creatorApplicationCollection.UpdateOneAsync(idFilter, userUpdates);

        var user = await _userCollection.Find(user => user.Id == creatorApplication.UserId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        if (user.PhoneNumber is not null && user.PhoneNumberVerifiedAt is not null)
        {
            var _ = SmsConfiguration.SendSms(new SendSmsInput
            {
                PhoneNumber = user.PhoneNumber,
                Message = EmailTemplates.CreatorApplicationRejectedBody.Replace("{name}", user.Name).Replace("{reason}", input.Reason),
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
                Subject = EmailTemplates.CreatorApplicationRejectedSubject,
                Message = EmailTemplates.CreatorApplicationRejectedBody.Replace("{name}", user.Name).Replace("{reason}", input.Reason),
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }

        return creatorApplication;
    }

    public async Task<CreatorApplication> GetUserActiveCreatorApplication(string userId){
        var creatorApplication = await _creatorApplicationCollection.Find(application => application.UserId == userId)
            .SortByDescending(application => application.CreatedAt)
            .FirstOrDefaultAsync();

        return creatorApplication;
    }
    
}

