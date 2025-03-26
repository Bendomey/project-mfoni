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
using Newtonsoft.Json;

namespace main.Domains;

public class UserService
{
    private readonly ILogger<UserService> _logger;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly IMongoCollection<Models.CreatorApplication> _creatorApplicationCollection;
    private readonly IMongoCollection<Models.WalletTransaction> _walletTransactionCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly PaymentService _paymentService;

    public UserService(
        ILogger<UserService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider,
        PaymentService paymentService
    )
    {
        _logger = logger;
        _userCollection = databaseConfig.Database.GetCollection<Models.User>(
            appConstants.Value.UserCollection
        );
        _creatorApplicationCollection =
            databaseConfig.Database.GetCollection<Models.CreatorApplication>(
                appConstants.Value.CreatorApplicatonCollection
            );
        _walletTransactionCollection = databaseConfig.Database.GetCollection<Models.WalletTransaction>(
            appConstants.Value.WalletTransactionCollection
        );
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;

        _paymentService = paymentService;

        logger.LogDebug("User service initialized");
    }

    public bool SetupAccount(SetupAccountInput accountInput, CurrentUserOutput userInput)
    {
        var user = _userCollection
            .Find<Models.User>(user => user.Id == userInput.Id)
            .FirstOrDefault();

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
        var userExistsWithPhoneNumber = await _userCollection
            .Find(user => user.PhoneNumber == normalizedPhoneNumber)
            .FirstOrDefaultAsync();
        if (userExistsWithPhoneNumber != null && userExistsWithPhoneNumber.Id != userId)
        {
            throw new HttpRequestException("PhoneNumberAlreadyExists");
        }

        var filter = Builders<Models.User>.Filter.Eq(u => u.Id, userId);
        var updates = Builders<Models.User>.Update.Set(r => r.PhoneNumber, normalizedPhoneNumber);

        if (normalizedPhoneNumber != user.PhoneNumber)
        {
            updates = updates.Set(r => r.PhoneNumberVerifiedAt, null);
        }

        await _userCollection.UpdateOneAsync(filter, updates);

        var code = Nanoid.Generate("1234567890", 5);
        await _cacheProvider.SetCache($"verify-{user.Id}", code, TimeSpan.FromHours(1));

        await SmsConfiguration.SendSms(
            new SendSmsInput
            {
                PhoneNumber = normalizedPhoneNumber,
                Message = EmailTemplates
                    .VerifyPhoneNumberBody.Replace("{code}", code)
                    .Replace("{name}", user.Name),
                AppId = _appConstantsConfiguration.SmsAppId,
                AppSecret = _appConstantsConfiguration.SmsAppSecret
            }
        );

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

        var verificationCode = await _cacheProvider.GetFromCache<Int64>($"verify-{user.Id}");

        if (code != verificationCode.ToString())
        {
            throw new HttpRequestException("CodeIsIncorrectOrHasExpired");
        }

        var filter = Builders<Models.User>.Filter.Eq(r => r.Id, user.Id);
        var updates = Builders<Models.User>.Update.Set(v => v.PhoneNumberVerifiedAt, DateTime.Now);
        await _userCollection.UpdateOneAsync(filter, updates);

        await _cacheProvider.ClearCache($"verify-{user.Id}");
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

        var code = Nanoid.Generate("1234567890", 5);
        await _cacheProvider.SetCache($"verify-{user.Id}", code, TimeSpan.FromHours(1));

        var _ = EmailConfiguration.Send(
            new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = emailAddress,
                Subject = EmailTemplates.VerifyAccountSubject,
                Message = EmailTemplates.VerifyPhoneNumberBody
                    .Replace("{code}", code)
                    .Replace("{name}", user.Name)
                    .Replace("{validity}", "1 hour"),
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

        var verificationCode = await _cacheProvider.GetFromCache<Int64>($"verify-{user.Id}");
        if (code != verificationCode.ToString())
        {
            throw new HttpRequestException("CodeIsIncorrectOrHasExpired");
        }

        var filter = Builders<Models.User>.Filter.Eq(r => r.Id, user.Id);
        var updates = Builders<Models.User>.Update.Set(v => v.EmailVerifiedAt, DateTime.Now);
        await _userCollection.UpdateOneAsync(filter, updates);

        await _cacheProvider.ClearCache($"verify-{user.Id}");
        return true;
    }


    public async Task<List<Models.User>> GetUsers(
        FilterQuery<Models.User> queryFilter,
        GetUsersInput input
    )
    {
        FilterDefinitionBuilder<Models.User> builder = Builders<Models.User>.Filter;
        var filter = builder.Empty;
        List<string> filters = ["status", "role", "provider", "name"];

        List<string> filterValues = [input.Status, input.Role, input.Provider, input.Search];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);

        var users = await _userCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return users ?? [];
    }

    public async Task<long> CountUsers(GetUsersInput input)
    {
        FilterDefinitionBuilder<Models.User> builder = Builders<Models.User>.Filter;
        var filter = builder.Empty;
        List<string> filters = ["status", "role", "provider", "name"];

        List<string> filterValues = [input.Status, input.Role, input.Provider, input.Search];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);

        long usersCount = await _userCollection.CountDocumentsAsync(filter);
        return usersCount;
    }

    public async Task<Models.User> GetUserById(string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        return user;
    }

    public async Task<TopupWalletOutput> InitiateWalletTopup(InitiateWalletTopupInput input)
    {
        if (input.WalletTransactionId is not null)
        {
            return await this.FullfilWalletTopup(new FullfilWalletTopup
            {
                WalletTransactionId = input.WalletTransactionId
            });
        }

        var user = await GetUserById(input.UserId);

        var walletTransaction = new WalletTransaction
        {
            UserId = input.UserId,
            Type = WalletTransactionType.DEPOSIT,
            Amount = input.Amount,
            ReasonForTransfer = WalletTransactionReasonForTransfer.TOPUP,
            Status = WalletTransactionStatus.PENDING,
        };
        await _walletTransactionCollection.InsertOneAsync(walletTransaction);

        var newPayment = await InitiateWalletTopupPayment(walletTransaction.Id, input.Amount, user);

        return new TopupWalletOutput
        {
            Payment = newPayment,
            WalletTransaction = walletTransaction,
        };
    }

    public async Task<TopupWalletOutput> FullfilWalletTopup(FullfilWalletTopup input)
    {
        var walletTransaction = await _walletTransactionCollection.Find(wt => wt.Id == input.WalletTransactionId).FirstOrDefaultAsync();
        if (walletTransaction is null)
        {
            throw new HttpRequestException("WalletTransactionNotFound");
        }

        if (walletTransaction.Status != WalletTransactionStatus.PENDING)
        {
            throw new HttpRequestException("WalletTransactionAlreadyProcessed");
        }

        var payment = await _paymentService.GetPaymentByContentWalletId(walletTransaction.Id);
        var paymentHasExpired = DateTime.UtcNow.Subtract(payment.CreatedAt).TotalHours > 24; // paystack automatically expires after 24 hours.

        if (paymentHasExpired)
        {
            await _paymentService.CancelPayment(payment.Id, new PaymentError
            {
                Message = "Payment link has expired"
            });

            var user = await GetUserById(walletTransaction.UserId);
            var newPayment = await InitiateWalletTopupPayment(walletTransaction.Id, payment.Amount, user);

            return new TopupWalletOutput
            {
                Payment = newPayment,
                WalletTransaction = walletTransaction,
            };

        }

        // purchase link is still active so user can proceed.
        return new TopupWalletOutput
        {
            Payment = payment,
            WalletTransaction = walletTransaction,
        };

    }

    private async Task<Payment> InitiateWalletTopupPayment(string walletTransactionId, long amount, Models.User user)
    {
        // initiate payment
        var paymentMetadata = new InitPaymentMedataInput
        {
            Origin = PaymentMetaDataOrigin.WalletTopup,
            WalletId = walletTransactionId,
            CustomFields = new[]
            {
                new InitPaymentMedataCustomFieldsInput
                {
                    DisplayName = "Origin Type",
                    VariableName = "origin",
                    Value = PaymentMetaDataOrigin.WalletTopup
                },
                new InitPaymentMedataCustomFieldsInput
                {
                    DisplayName = "Wallet Id",
                    VariableName = "wallet_id",
                    Value = walletTransactionId
                },
            }
        };

        var newPayment = await _paymentService.InitiatePayment(new InitializePaymentInput
        {
            Origin = PaymentMetaDataOrigin.WalletTopup,
            WalletId = walletTransactionId,
            PaystackInput = new InitPaymentInput
            {
                Amount = amount,
                Email = user.Email != null && user.EmailVerifiedAt != null ? user.Email : _appConstantsConfiguration.MfoniPaymentEmail, // use defualt mfoni email to hold all paystack payments if user have no email.
                Metadata = JsonConvert.SerializeObject(paymentMetadata)
            }
        });

        return newPayment;
    }

}
