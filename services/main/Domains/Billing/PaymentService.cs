
using main.Configurations;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace main.Domains;

public class PaymentService
{
    private readonly ILogger<WalletService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Payment> _paymentCollection;
    private readonly IMongoCollection<ContentPurchase> _contentPurchaseCollection;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly IMongoCollection<Models.Content> _contentsCollection;
    private readonly AdminWalletService _adminWalletService;
    private readonly UserService _userService;
    private readonly IMongoCollection<Models.AdminWallet> _adminWalletCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly WalletService _walletService;

    public PaymentService(
        ILogger<WalletService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        AdminWalletService adminWalletService,
        CacheProvider cacheProvider,
        UserService userService,
        WalletService walletService
       )
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;

        _paymentCollection = databaseConfig.Database.GetCollection<Payment>(
         appConstants.Value.PaymentCollection
        );
        _contentPurchaseCollection = databaseConfig.Database.GetCollection<ContentPurchase>(
            appConstants.Value.ContentPurchaseCollection
        );
        _contentsCollection = databaseConfig.Database.GetCollection<Models.Content>(
            appConstants.Value.ContentCollection
        );

        _userCollection = databaseConfig.Database.GetCollection<Models.User>(
            appConstants.Value.UserCollection
        );

        _adminWalletCollection = databaseConfig.Database.GetCollection<Models.AdminWallet>(
            appConstants.Value.AdminWalletCollection
        );

        _adminWalletService = adminWalletService;
        _walletService = walletService;
        _userService = userService;
        _cacheProvider = cacheProvider;

        logger.LogDebug("Payment service initialized");
    }

    public async Task<Payment> InitiatePayment(InitializePaymentInput input)
    {
        var response = await PaymentConfiguration.Initiate(_appConstantsConfiguration.PaystackSecretKey, input.PaystackInput);

        if (response is null)
        {
            throw new HttpRequestException("PaymentInitiationFailed");
        }

        var newPayment = new Models.Payment
        {
            AccessCode = response.AccessCode,
            Amount = input.PaystackInput.Amount,
            AuthorizationUrl = response.AuthorizationUrl,
            Reference = response.Reference,
            Status = PaymentStatus.PENDING,
            MetaData = new PaymentMetaData
            {
                Origin = input.Origin,
                ContentPurchaseId = input.ContentPurchaseId,
                WalletId = input.WalletId
            },
        };

        await _paymentCollection.InsertOneAsync(newPayment);

        return newPayment;
    }

    public async Task VerifyPayment(DTOs.PaystackWebhookInput input)
    {
        var paymentRecord = await _paymentCollection.Find(payment => payment.Reference == input.Data.Reference)
             .FirstOrDefaultAsync();

        if (paymentRecord is null)
        {
            throw new HttpRequestException("PaymentRecordNotFound");
        }

        await _paymentCollection.UpdateOneAsync(
            Builders<Payment>.Filter.Eq(payment => payment.Id, paymentRecord.Id),
            Builders<Payment>.Update
                .Set(payment => payment.Status, PaymentStatus.SUCCESSFUL)
                .Set(payment => payment.SuccessfulAt, DateTime.UtcNow)
                .Set(payment => payment.Channel, input.Data.Channel)
                .Set(payment => payment.UpdatedAt, DateTime.UtcNow)
                .Unset(payment => payment.AuthorizationUrl)
                .Unset(payment => payment.AccessCode)
        );

        // when it's related to a content purchase.
        if (paymentRecord.MetaData.Origin == PaymentMetaDataOrigin.ContentPurchase && !string.IsNullOrEmpty(paymentRecord.MetaData.ContentPurchaseId))
        {
            var contentPurchase = await _contentPurchaseCollection
                .Find(contentPurchase => contentPurchase.Id == paymentRecord.MetaData.ContentPurchaseId)
                .FirstOrDefaultAsync();

            if (contentPurchase is null)
            {
                throw new HttpRequestException("ContentPurchaseNotFound");
            }

            var user = await _userService.GetUserById(contentPurchase.UserId);
            var content = await _contentsCollection.Find(c => c.Id == contentPurchase.ContentId).FirstOrDefaultAsync();
            if (content == null)
            {
                throw new HttpRequestException("ContentNotfound");
            }

            var creatorUser = await _userService.GetUserById(content.CreatedById);

            // deposit to creator
            var walletTo = await _walletService.Deposit(new WalletDepositInput
            {
                Amount = contentPurchase.Amount,
                UserId = content.CreatedById,
                ReasonForTransfer = WalletTransactionReasonForTransfer.CONTENT_PURCHASE,
            });

            await _contentPurchaseCollection.UpdateOneAsync(
                Builders<ContentPurchase>.Filter.Eq(contentPurchase => contentPurchase.Id, contentPurchase.Id),
                Builders<ContentPurchase>.Update
                    .Set(contentPurchase => contentPurchase.WalletTo, walletTo.Id)
                    .Set(contentPurchase => contentPurchase.Status, ContentPurchaseStatus.SUCCESSFUL)
                    .Set(contentPurchase => contentPurchase.PaymentId, paymentRecord.Id)
                    .Set(contentPurchase => contentPurchase.SuccessfulAt, DateTime.UtcNow)
                    .Set(contentPurchase => contentPurchase.UpdatedAt, DateTime.UtcNow)
            );

            // send out notifications to creator and user for a successful purchase.
            SendNotification(
                user,
                EmailTemplates.SuccessfulContentPurchaseSubjectForBuyer,
                EmailTemplates.SuccessfulContentPurchaseBodyForBuyer
                    .Replace("{name}", user.Name)
                    .Replace("{contentName}", content.Title)
                    .Replace("{creatorName}", creatorUser.Name)
                    .Replace("{paymentMethod}", StringLib.normalizePaystackChannel(StringLib.SafeString(paymentRecord.Channel)))
                    .Replace("{downloadLink}", $"{_appConstantsConfiguration.WebsiteUrl}/photos/{content.Slug}?download=true")
                    .Replace("{amount}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(paymentRecord.Amount):0.00}")
            );

            SendNotification(
               creatorUser,
               EmailTemplates.SuccessfulContentPurchaseSubjectForCreator,
               EmailTemplates.SuccessfulContentPurchaseBodyForCreator
                   .Replace("{name}", creatorUser.Name)
                   .Replace("{contentName}", content.Title)
                   .Replace("{buyerName}", user.Name)
                   .Replace("{amount}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(paymentRecord.Amount):0.00}")
            );

            _ = _cacheProvider.EntityChanged(new[] {
                $"{CacheProvider.CacheEntities["contents"]}.find*",
                $"{CacheProvider.CacheEntities["contents"]}*{content.Id}*",
                $"{CacheProvider.CacheEntities["contents"]}*{content.Slug}*",
            });
        }
        else if (paymentRecord.MetaData.Origin == PaymentMetaDataOrigin.WalletTopup && !string.IsNullOrEmpty(paymentRecord.MetaData.WalletId))
        {
            // TODO: when it's related to wallet topup.

        }
    }

    public async Task<Payment> GetPaymentById(string paymentId)
    {
        var paymentRecord = await _paymentCollection.Find(payment => payment.Id == paymentId)
            .FirstOrDefaultAsync();

        if (paymentRecord is null)
        {
            throw new HttpRequestException("PaymentNotFound");
        }

        return paymentRecord;
    }

    public async Task<Payment> GetPaymentByContentPurchaseId(string contentPurchaseId)
    {

        var filter = Builders<Payment>.Filter.Eq(payment => payment.MetaData.ContentPurchaseId, contentPurchaseId);
        filter = filter & Builders<Payment>.Filter.Eq(payment => payment.Status, PaymentStatus.PENDING);

        var paymentRecord = await _paymentCollection.Find(filter)
            .FirstOrDefaultAsync();

        if (paymentRecord is null)
        {
            throw new HttpRequestException("PaymentNotFound");
        }

        return paymentRecord;
    }

    public async Task<bool> CancelPayment(string paymentId, PaymentError paymentError)
    {
        await _paymentCollection.UpdateOneAsync(
             Builders<Payment>.Filter.Eq(payment => payment.Id, paymentId),
             Builders<Payment>.Update
                .Set(payment => payment.Status, PaymentStatus.CANCELLED)
                .Unset(payment => payment.AuthorizationUrl)
                .Unset(payment => payment.AccessCode)
                .Set(payment => payment.ErrorObj, paymentError)
                .Set(payment => payment.CancelledAt, DateTime.UtcNow)
                .Set(payment => payment.UpdatedAt, DateTime.UtcNow)
         );

        return true;
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