using System.Net;
using main.Configurations;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
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

    public async Task<PurchaseContentOutput?> PurchaseContent(PurchaseContentInput input)
    {
        var content = await _contentsCollection.Find(c => c.Id == input.ContentId).FirstOrDefaultAsync();
        if (content == null)
        {
            throw new HttpRequestException("ContentNotFound", default, HttpStatusCode.NotFound);
        }

        if (content.Amount == 0)
        {
            throw new HttpRequestException("ContentIsFree");
        }

        var user = await _userService.GetUserById(input.UserId);

        var filter = Builders<ContentPurchase>.Filter.Eq(p => p.ContentId, content.Id);
        filter &= Builders<ContentPurchase>.Filter.Eq(p => p.UserId, user.Id);

        var existingPurchase = await _contentPurchasesCollection.Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        if (existingPurchase != null)
        {
            if (existingPurchase.Status == ContentPurchaseStatus.SUCCESSFUL)
            {
                throw new HttpRequestException("ContentAlreadyPurchased");
            }

            // pending cases are only going to be for ONE_TIME and SAVED_CARD scenarios
            if (existingPurchase.Status == ContentPurchaseStatus.PENDING)
            {

                if (existingPurchase.Type == input.PaymentMethod)
                {
                    // check if payment is expired, if so, cancel that one and initiate a new one.
                    if (existingPurchase.Type == ContentPurchaseType.ONE_TIME)
                    {
                        var payment = await _paymentService.GetPaymentByContentPurchaseId(existingPurchase.Id);
                        var paymentHasExpired = DateTime.UtcNow.Subtract(payment.CreatedAt).TotalHours > 24; // paystack automatically expires after 24 hours.

                        if (paymentHasExpired)
                        {
                            await _paymentService.CancelPayment(payment.Id, new PaymentError
                            {
                                Message = "Payment link has expired"
                            });
                            var newContentPurchaseForOneTime = await PayWithOneTime(new PayWithWalletInput
                            {
                                Amount = content.Amount,
                                User = user,
                                CreatorId = content.CreatedById,
                                ContentId = content.Id,
                                ContentPurchase = existingPurchase
                            });

                            return newContentPurchaseForOneTime;
                        }
                        else
                        {
                            // purchase link is still active so user can proceed.
                            return new PurchaseContentOutput
                            {
                                Payment = payment,
                                ContentPurchase = existingPurchase
                            };
                        }
                    }
                    else
                    {
                        // TODO: work on saved card payment.
                    }
                }
                else
                {
                    if (existingPurchase.Type == ContentPurchaseType.ONE_TIME && existingPurchase.PaymentId != null)
                    {
                        await _paymentService.CancelPayment(existingPurchase.PaymentId, new PaymentError
                        {
                            Message = "Payment was cancelled because a new payment method was selected."
                        });
                    }

                    // if it's a new type, then we cancel the current purchase record and start over(creating new purchase).
                    await _contentPurchasesCollection.UpdateOneAsync(
                        Builders<ContentPurchase>.Filter.Eq(p => p.Id, existingPurchase.Id),
                        Builders<ContentPurchase>.Update
                        .Set(p => p.Status, ContentPurchaseStatus.CANCELLED)
                        .Set(p => p.UpdatedAt, DateTime.UtcNow)
                        .Set(p => p.CancelledAt, DateTime.UtcNow)
                        .Set(p => p.ErrorObj, new ContentPurchaseError
                        {
                            Message = "Purchase was cancelled because a new payment method was selected."
                        })
                    );
                }
            }

            // if it's failed/canceled, continue with a new purchase.
        }

        switch (input.PaymentMethod)
        {
            case "ONE_TIME":
                var payWithOneTimeRes = await PayWithOneTime(new PayWithWalletInput
                {
                    Amount = content.Amount,
                    User = user,
                    CreatorId = content.CreatedById,
                    ContentId = content.Id,
                });

                return payWithOneTimeRes;

            case "WALLET":
                var newContentPurchaseForWallet = await PayWithWallet(new PayWithWalletInput
                {
                    Amount = content.Amount,
                    User = user,
                    CreatorId = content.CreatedById,
                    ContentId = content.Id
                });

                var creatorUser = await _userService.GetUserById(content.CreatedById);

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
                        .Replace("{amount}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(content.Amount):0.00}")
                );

                SendNotification(
                   creatorUser,
                   EmailTemplates.SuccessfulContentPurchaseSubjectForCreator,
                   EmailTemplates.SuccessfulContentPurchaseBodyForCreator
                       .Replace("{name}", creatorUser.Name)
                       .Replace("{contentName}", content.Title)
                       .Replace("{buyerName}", user.Name)
                       .Replace("{amount}", $"GH₵ {MoneyLib.ConvertPesewasToCedis(content.Amount):0.00}")
                );

                _ = _cacheProvider.EntityChanged(new[] {
                    $"{CacheProvider.CacheEntities["contents"]}.find*",
                    $"{CacheProvider.CacheEntities["contents"]}*{input.ContentId}*",
                    $"{CacheProvider.CacheEntities["contents"]}*{content.Slug}*",
                });

                return new PurchaseContentOutput
                {
                    ContentPurchase = newContentPurchaseForWallet!
                };

            case "SAVED_CARD":
                // TODO: we don't support saved cards just yet. So FE should not send this.
                throw new HttpRequestException("InvalidPaymentMmethod");

            default:
                throw new HttpRequestException("InvalidPaymentMmethod");
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

    private async Task<PurchaseContentOutput?> PayWithOneTime(PayWithWalletInput input)
    {
        var contentPurchaseForOneTime = input.ContentPurchase;

        if (contentPurchaseForOneTime == null)
        {
            var newContentPurchaseForOneTime = new Models.ContentPurchase
            {
                Amount = input.Amount,
                ContentId = input.ContentId,
                Type = ContentPurchaseType.ONE_TIME,
                UserId = input.User.Id,
            };
            await _contentPurchasesCollection.InsertOneAsync(newContentPurchaseForOneTime);

            contentPurchaseForOneTime = newContentPurchaseForOneTime;
        }

        // initiate payment
        var paymentMetadata = new InitPaymentMedataInput
        {
            Origin = PaymentMetaDataOrigin.ContentPurchase,
            ContentPurchaseId = contentPurchaseForOneTime.Id,
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
                    Value = contentPurchaseForOneTime.Id
                },
            }
        };

        var newPayment = await _paymentService.InitiatePayment(new InitializePaymentInput
        {
            Origin = PaymentMetaDataOrigin.ContentPurchase,
            ContentPurchaseId = contentPurchaseForOneTime.Id,
            PaystackInput = new InitPaymentInput
            {
                Amount = input.Amount,
                Email = input.User.Email != null && input.User.EmailVerifiedAt != null ? input.User.Email : _appConstantsConfiguration.MfoniPaymentEmail, // use defualt mfoni email to hold all paystack payments if user have no email.
                Metadata = JsonConvert.SerializeObject(paymentMetadata)
            }
        });

        return new PurchaseContentOutput
        {
            Payment = newPayment,
            ContentPurchase = contentPurchaseForOneTime,
        };
    }

    public async Task<ContentPurchase> GetSuccessfulContentPurchaseByContentId(string contentId, string userId)
    {
        var filter = Builders<ContentPurchase>.Filter.Eq(p => p.ContentId, contentId);
        filter &= Builders<ContentPurchase>.Filter.Eq(p => p.UserId, userId);
        filter &= Builders<ContentPurchase>.Filter.Eq(p => p.Status, ContentPurchaseStatus.SUCCESSFUL);

        return await _contentPurchasesCollection.Find(filter).FirstOrDefaultAsync();
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

    public async Task<List<Models.ContentPurchase>> GetContentPurchases(
        FilterQuery<Models.ContentPurchase> queryFilter,
        GetContentPurchasesInput input
    )
    {
        FilterDefinitionBuilder<Models.ContentPurchase> builder = Builders<Models.ContentPurchase>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrEmpty(input.ContentId))
        {
            filter = builder.Eq(r => r.ContentId, input.ContentId);
        }

        if (!string.IsNullOrEmpty(input.Type))
        {
            filter = builder.Eq(r => r.Type, input.Type);
        }

        if (!string.IsNullOrEmpty(input.Status))
        {
            filter = builder.Eq(r => r.Status, input.Status);
        }

        if (!string.IsNullOrEmpty(input.UserId))
        {
            filter &= builder.Eq(r => r.UserId, input.UserId);
        }

        var purchases = await _contentPurchasesCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return purchases ?? [];
    }

    public async Task<long> CountContentPurchases(GetContentPurchasesInput input)
    {
        FilterDefinitionBuilder<Models.ContentPurchase> builder = Builders<Models.ContentPurchase>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrEmpty(input.ContentId))
        {
            filter = builder.Eq(r => r.ContentId, input.ContentId);
        }

        if (!string.IsNullOrEmpty(input.Type))
        {
            filter = builder.Eq(r => r.Type, input.Type);
        }

        if (!string.IsNullOrEmpty(input.Status))
        {
            filter = builder.Eq(r => r.Status, input.Status);
        }

        if (!string.IsNullOrEmpty(input.UserId))
        {
            filter &= builder.Eq(r => r.UserId, input.UserId);
        }

        var count = await _contentPurchasesCollection.CountDocumentsAsync(filter);

        return count;
    }

}