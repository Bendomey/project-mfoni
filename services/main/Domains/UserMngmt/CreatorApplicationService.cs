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

public class CreatorApplicationService
{
    private readonly ILogger<UserService> _logger;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly IMongoCollection<Models.Admin> _adminCollection;
    private readonly IMongoCollection<Models.CreatorApplication> _creatorApplicationCollection;
    private readonly IMongoCollection<Models.Creator> _creatorCollection;
    private readonly IMongoCollection<Models.CreatorPackage> _creatorPackageCollection;
    private readonly AppConstants _appConstantsConfiguration;

    public CreatorApplicationService(
        ILogger<UserService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants
    )
    {
        _logger = logger;
        _userCollection = databaseConfig.Database.GetCollection<Models.User>(
            appConstants.Value.UserCollection
        );
        _adminCollection = databaseConfig.Database.GetCollection<Models.Admin>(
            appConstants.Value.AdminCollection
        );
        _creatorApplicationCollection =
            databaseConfig.Database.GetCollection<Models.CreatorApplication>(
                appConstants.Value.CreatorApplicatonCollection
            );
        _creatorCollection = databaseConfig.Database.GetCollection<Models.Creator>(
            appConstants.Value.CreatorCollection
        );
        _creatorPackageCollection = databaseConfig.Database.GetCollection<Models.CreatorPackage>(appConstants.Value.CreatorPackageCollection);
        _appConstantsConfiguration = appConstants.Value;

        logger.LogDebug("User service initialized");
    }

    public async Task<CreatorApplication> CreateCreatorApplication(CreateCreatorApplicationInput input, string userId)
    {
        // check if user already has an active creator application
        var activeCreatorApplication = await _creatorApplicationCollection.Find(application => application.UserId == userId && application.Status != CreatorApplicationStatus.REJECTED)
            .FirstOrDefaultAsync();

        if (activeCreatorApplication is not null)
        {
            throw new HttpRequestException("CreatorApplicationAlreadyExists");
        }

        var __newCreatorApplication = new Models.CreatorApplication
        {
            UserId = userId,
            IdType = input.IdType,
            IdBackImage = input.IdBackImage,
            IdFrontImage = input.IdFrontImage,
            IntendedPricingPackage = input.CreatorPackageType,
        };
        _creatorApplicationCollection.InsertOne(__newCreatorApplication);

        return __newCreatorApplication;
    }

    public async Task<CreatorApplication> UpdateCreatorApplication(UpdateCreatorApplicationInput input, string creatorApplicationId)
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
            .Set(r => r.IdFrontImage, input.IdFrontImage)
            .Set(r => r.IdBackImage, input.IdBackImage)
            .Set(r => r.UpdatedAt, DateTime.UtcNow);

        if (input.CreatorPackageType is not null)
        {
            userUpdates = userUpdates.Set(r => r.IntendedPricingPackage, input.CreatorPackageType);
        }

        if (input.IdType is not null)
        {
            userUpdates = userUpdates.Set(r => r.IdType, input.IdType);
        }

        if (input.IdFrontImage is not null)
        {
            userUpdates = userUpdates.Set(r => r.IdFrontImage, input.IdFrontImage);
        }

        if (input.IdBackImage is not null)
        {
            userUpdates = userUpdates.Set(r => r.IdBackImage, input.IdBackImage);
        }

        await _creatorApplicationCollection.UpdateOneAsync(idFilter, userUpdates);

        return creatorApplication;
    }

    public async Task<CreatorApplication> SubmitCreatorApplication(string creatorApplicationId)
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

        // make sure that all required fields are set
        if (creatorApplication.IdType is null)
        {
            throw new HttpRequestException("IdTypeNotSet");
        }

        if (creatorApplication.IdFrontImage is null)
        {
            throw new HttpRequestException("IdFrontImageNotSet");
        }

        if (creatorApplication.IdBackImage is null)
        {
            throw new HttpRequestException("IdFrontImageNotSet");
        }

        if (creatorApplication.IntendedPricingPackage is null)
        {
            throw new HttpRequestException("PackageTypeNotSet");
        }

        var idFilter = Builders<CreatorApplication>.Filter.Eq(r => r.Id, creatorApplication.Id);
        var userUpdates = Builders<CreatorApplication>.Update
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

        var user = await _userCollection.Find(user => user.Id == creatorApplication.UserId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        var creator = new Creator
        {
            CreatorApplicationId = creatorApplication.Id,
            UserId = creatorApplication.UserId,
            Username = $"{user.Name.ToLower().Replace(" ", "")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 5)}",
        };

        await _creatorCollection.InsertOneAsync(creator);

        // this check should always be true. 
        if (creatorApplication.IntendedPricingPackage is not null)
        {
            // TODO: Come back and think through this bit.
            var creatorPackage = new CreatorPackage
            {
                CreatorId = creator.Id,
                PackageType = creatorApplication.IntendedPricingPackage,
                Status = CreatorPackageStatus.ACTIVE,
            };

            await _creatorPackageCollection.InsertOneAsync(creatorPackage);
        }
        else
        {
            // this shouldn't happen. but just in case
            throw new HttpRequestException("PackageTypeNotSet");
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

    public async Task<CreatorApplication> GetUserActiveCreatorApplication(string userId)
    {
        var creatorApplication = await _creatorApplicationCollection.Find(application => application.UserId == userId)
            .SortByDescending(application => application.CreatedAt)
            .FirstOrDefaultAsync();

        return creatorApplication;
    }

    public async Task<List<CreatorApplication>> GetCreatorApplications(
        FilterQuery<CreatorApplication> queryFilter,
        string? status
    )
    {
        FilterDefinitionBuilder<CreatorApplication> builder = Builders<CreatorApplication>.Filter;
        var filter = builder.Empty;

        List<string> filters = ["status"];
        List<string> filterValues = [status];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);
        var creatorApplications = await _creatorApplicationCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return creatorApplications ?? [];
    }

    public async Task<long> CountCreatorApplications(string? status)
    {
        FilterDefinitionBuilder<CreatorApplication> builder = Builders<CreatorApplication>.Filter;
        var filter = builder.Empty;

        List<string> filters = ["status"];
        List<string> filterValues = [status];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);

        long creatorApplicationsCount = await _creatorApplicationCollection.CountDocumentsAsync(
            filter
        );
        return creatorApplicationsCount;
    }
}
