
using main.Configurations;
using main.Configuratons;
using main.Lib;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Domains;

public class TransferService
{
    private readonly ILogger<TransferService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.TransferRecipient> _transferRecipientCollection;
    private readonly IMongoCollection<Models.Transfer> _transferCollection;
    private readonly IMongoCollection<Models.User> _userCollection;

    public TransferService(
        ILogger<TransferService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants
    )
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;

        _transferRecipientCollection = databaseConfig.Database.GetCollection<Models.TransferRecipient>(
            appConstants.Value.TransferRecipientCollection
        );

        _transferCollection = databaseConfig.Database.GetCollection<Models.Transfer>(
            appConstants.Value.TransferCollection
        );

        _userCollection = databaseConfig.Database.GetCollection<Models.User>(
            appConstants.Value.UserCollection
        );

        logger.LogDebug("Transfer service initialized");
    }

    public async Task<Models.TransferRecipient> CreateTransferRecipient(CreateTransferRecipientInput input)
    {
        var oldRecipient = await _transferRecipientCollection
            .Find(x => x.AccountNumber == input.AccountNumber && x.CreatedById == input.CreatedById)
            .FirstOrDefaultAsync();

        if (oldRecipient != null)
        {
            throw new Exception("TransferRecipientAlreadyExists");
        }

        var response = await PaystackTransferRecipientConfiguration.CreateRecipient(_appConstantsConfiguration.PaystackSecretKey, new CreateRecipientInput
        {
            Name = input.AccountName,
            Type = input.Type,
            AccountNumber = input.AccountNumber,
            BankCode = input.BankCode,
        });

        if (response is null)
        {
            throw new HttpRequestException("TransferRecipientFailed");
        }

        var recipient = new Models.TransferRecipient
        {
            CreatedById = input.CreatedById,
            Type = input.Type,
            RecipientCode = response.RecipientCode,
            AccountNumber = input.AccountNumber,
            AccountName = input.AccountName,
            BankName = input.BankName,
            BankCode = input.BankCode
        };

        await _transferRecipientCollection.InsertOneAsync(recipient);

        return recipient;
    }


    public async Task DeleteTransferRecipient(DeleteTransferRecipientInput input)
    {
        var recipient = await _transferRecipientCollection
            .Find(x => x.Id == input.TransferRecipientId && x.CreatedById == input.CreatedById && x.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (recipient is null)
        {
            throw new Exception("TransferRecipientNotFound");
        }

        await _transferRecipientCollection.UpdateOneAsync(
            x => x.Id == input.TransferRecipientId,
            Builders<Models.TransferRecipient>.Update
                .Set(x => x.DeletedAt, DateTime.UtcNow)
        );
    }

    public async Task<List<Models.TransferRecipient>> GetTransferRecipients(
        FilterQuery<Models.TransferRecipient> queryFilter,
        GetTransferRecipientInput input
    )
    {
        FilterDefinitionBuilder<Models.TransferRecipient> builder = Builders<Models.TransferRecipient>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrEmpty(input.CreatedById))
        {
            filter = filter & builder.Eq(x => x.CreatedById, input.CreatedById);
        }

        if (!string.IsNullOrEmpty(input.BankCode))
        {
            filter = filter & builder.Eq(x => x.BankCode, input.BankCode);
        }

        filter &= builder.Eq(x => x.DeletedAt, null);

        var recipients = await _transferRecipientCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return recipients ?? [];
    }

    public async Task<long> CountTransferRecipients(
        GetTransferRecipientInput input
    )
    {
        FilterDefinitionBuilder<Models.TransferRecipient> builder = Builders<Models.TransferRecipient>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrEmpty(input.CreatedById))
        {
            filter = filter & builder.Eq(x => x.CreatedById, input.CreatedById);
        }

        if (!string.IsNullOrEmpty(input.BankCode))
        {
            filter = filter & builder.Eq(x => x.BankCode, input.BankCode);
        }

        filter &= builder.Eq(x => x.DeletedAt, null);

        var recipientsCount = await _transferRecipientCollection
            .CountDocumentsAsync(filter);

        return recipientsCount;
    }

    public async Task<Models.TransferRecipient> GetRecipientById(string id)
    {
        var recipient = await _transferRecipientCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (recipient is null)
        {
            throw new Exception("TransferRecipientNotFound");
        }

        return recipient;
    }

    public async Task<Models.Transfer> InitiateTransfer(InitiateTransferInput input)
    {
        // check if you have enough balance
        var user = await _userCollection.Find(x => x.Id == input.CreatedById).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new Exception("UserNotFound");
        }

        bool canIPay = user.BookWallet >= input.Amount;
        if (!canIPay)
        {
            throw new Exception("InsufficientBalance");
        }

        // check if transfer recipient exists
        var recipient = await GetRecipientById(input.TransferRecipientId);

        // initiate transfer
        var response = await PaystackTransferConfiguration.Initiate(_appConstantsConfiguration.PaystackSecretKey, new CreateTransferInput
        {
            Reference = input.Reference,
            Recipient = recipient.RecipientCode,
            Reason = input.Reason ?? "Transfering from my mfoni wallet",
            Amount = input.Amount,
        });

        if (response is null)
        {
            throw new HttpRequestException("TransferFailed");
        }

        // TODO: update user book balance

        var transfer = new Models.Transfer
        {
            TransferRecipientId = recipient.Id,
            Reference = response.Reference,
            RecipientCode = recipient.RecipientCode,
            TransferCode = response.TransferCode,
            Reason = input.Reason ?? "Transfering from my mfoni wallet",
            MetaData = new Models.TransferMetaData
            {
                // Todo: save wallet transaction here.
                WalletTransactionId = "",
            }
        };

        await _transferCollection.InsertOneAsync(transfer);

        return transfer;

    }
}