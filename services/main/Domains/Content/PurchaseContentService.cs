using System.Net;
using main.Configurations;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace main.Domains;

public class PurchaseContentService
{
    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IMongoCollection<ContentPurchase> _contentPurchasesCollection;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly CacheProvider _cacheProvider;
    private readonly UserService _userService;
    private readonly WalletService _walletService;
    private readonly PaymentService _paymentService;

    public PurchaseContentService(
        ILogger<IndexContent> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider,
        UserService userService,
        WalletService walletService,
        PaymentService paymentService
    )
    {
        _logger = logger;
        var database = databaseConfig.Database;

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _contentPurchasesCollection = database.GetCollection<ContentPurchase>(appConstants.Value.ContentPurchaseCollection);

        _walletService = walletService;
        _userService = userService;
        _paymentService = paymentService;
        _appConstantsConfiguration = appConstants.Value;
        _cacheProvider = cacheProvider;

        _logger.LogDebug("PurchaseContentService initialized");
    }

    public async Task<ContentPurchase?> PurchaseContent(PurchaseContentInput input)
    {
        var content = await _contentsCollection.Find(c => c.Id == input.ContentId).FirstOrDefaultAsync();
        if (content == null)
        {
            throw new HttpRequestException("Content not found", default, HttpStatusCode.NotFound);
        }

        if (content.Amount == 0)
        {
            throw new HttpRequestException("Content is free", default, HttpStatusCode.BadRequest);
        }

        var user = await _userService.GetUserById(input.UserId);
        var creatorUser = await _userService.GetUserById(content.CreatedById);

        switch (input.PaymentMethod)
        {
            case "ONE_TIME":
                var newContentPurchaseForOneTime = await PayWithOneTime(new PayWithWalletInput
                {
                    Amount = content.Amount,
                    User = user,
                    CreatorId = content.CreatedById,
                    ContentId = content.Id,
                });

                return newContentPurchaseForOneTime;

            case "WALLET":
                var newContentPurchaseForWallet = await PayWithWallet(new PayWithWalletInput
                {
                    Amount = content.Amount,
                    User = user,
                    CreatorId = content.CreatedById,
                    ContentId = content.Id
                });

                // send out notifications to creator and user for a successful purchase.
                SendNotification(
                    user,
                    EmailTemplates.SuccessfulContentPurchaseSubjectForBuyer,
                    EmailTemplates.SuccessfulContentPurchaseBodyForBuyer
                        .Replace("{name}", user.Name)
                        .Replace("{contentName}", content.Title)
                        .Replace("{creatorName}", creatorUser.Name)
                        .Replace("{paymentMethod}", "Wallet")
                        .Replace("{downloadLink}", $"{_appConstantsConfiguration.WebsiteUrl}/photos/{content.Slug}?download=true")
                        .Replace("{amount}", $"{MoneyLib.ConvertPesewasToCedis(content.Amount):0.00}")
                );

                SendNotification(
                   creatorUser,
                   EmailTemplates.SuccessfulContentPurchaseSubjectForCreator,
                   EmailTemplates.SuccessfulContentPurchaseBodyForCreator
                       .Replace("{name}", creatorUser.Name)
                       .Replace("{contentName}", content.Title)
                       .Replace("{buyerName}", user.Name)
                       .Replace("{amount}", $"{MoneyLib.ConvertPesewasToCedis(content.Amount):0.00}")
                );

                return newContentPurchaseForWallet;

            case "SAVED_CARD":
                // TODO: we don't support saved cards just yet. So FE should not send this.
                throw new HttpRequestException("Invalid payment method");

            default:
                throw new HttpRequestException("Invalid payment method");
        }
    }

    public async Task<ContentPurchase> GetContentPurchaseById(string purchaseId)
    {
        var purchase = await _contentPurchasesCollection.Find(contentPurchase => contentPurchase.Id == purchaseId)
            .FirstOrDefaultAsync();

        if (purchase is null)
        {
            throw new HttpRequestException("ContentPurchaseNotFound");
        }

        return purchase;
    }

    private async Task<ContentPurchase?> PayWithWallet(PayWithWalletInput input)
    {
        bool canIPayWithWallet = input.User.BookWallet >= input.Amount;

        if (!canIPayWithWallet)
        {
            throw new HttpRequestException("InsufficientFundsInWallet");
        }

        // withdraw from user
        var walletFrom = await _walletService.Withdraw(new WalletWithdrawInput
        {
            Amount = input.Amount,
            UserId = input.User.Id,
            ReasonForTransfer = WalletTransactionReasonForTransfer.CONTENT_PURCHASE,
        });

        // deposit to creator
        var walletTo = await _walletService.Deposit(new WalletDepositInput
        {
            Amount = input.Amount,
            UserId = input.CreatorId,
            ReasonForTransfer = WalletTransactionReasonForTransfer.CONTENT_PURCHASE,
        });

        var newContentPurchase = new Models.ContentPurchase
        {
            Amount = input.Amount,
            ContentId = input.ContentId,
            Type = ContentPurchaseType.WALLET,
            UserId = input.User.Id,
            Status = ContentPurchaseStatus.SUCCESSFUL,
            WalletFrom = walletFrom.Id,
            WalletTo = walletTo.Id,
        };

        await _contentPurchasesCollection.InsertOneAsync(newContentPurchase);

        return newContentPurchase;
    }

    private async Task<ContentPurchase?> PayWithOneTime(PayWithWalletInput input)
    {

        var newContentPurchaseForOneTime = new Models.ContentPurchase
        {
            Amount = input.Amount,
            ContentId = input.ContentId,
            Type = ContentPurchaseType.ONE_TIME,
            UserId = input.User.Id,
            Status = ContentPurchaseStatus.PENDING,
        };
        await _contentPurchasesCollection.InsertOneAsync(newContentPurchaseForOneTime);

        // initiate payment
        var paymentMetadata = new InitPaymentMedataInput
        {
            Origin = PaymentMetaDataOrigin.ContentPurchase,
            ContentPurchaseId = newContentPurchaseForOneTime.Id,
            CustomFields = new[]
            {
                new InitPaymentMedataCustomFieldsInput
                {
                    DisplayName = "Origin Type",
                    VariableName = "origin",
                    Value = PaymentMetaDataOrigin.ContentPurchase
                },
                new InitPaymentMedataCustomFieldsInput
                {
                    DisplayName = "Content Purchase Id",
                    VariableName = "content_purchase_id",
                    Value = newContentPurchaseForOneTime.Id
                },
            }
        };

        await _paymentService.InitiatePayment(new InitializePaymentInput
        {
            Origin = "ContentPurchase",
            ContentPurchaseId = newContentPurchaseForOneTime.Id,
            PaystackInput = new InitPaymentInput
            {
                Amount = input.Amount,
                Email = input.User.Email != null && input.User.EmailVerifiedAt != null ? input.User.Email : _appConstantsConfiguration.MfoniPaymentEmail, // use defualt mfoni email to hold all paystack payments if user have no email.
                Metadata = JsonConvert.SerializeObject(paymentMetadata)
            }
        });

        return newContentPurchaseForOneTime;
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