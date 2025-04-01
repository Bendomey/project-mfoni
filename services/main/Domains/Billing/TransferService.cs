
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
    private readonly IMongoCollection<Models.WalletTransaction> _walletTransactionCollection;

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

        _walletTransactionCollection = databaseConfig.Database.GetCollection<Models.WalletTransaction>(
            appConstants.Value.WalletTransactionCollection
        );

        logger.LogDebug("Transfer service initialized");
    }

    public async Task<Models.TransferRecipient> CreateTransferRecipient(CreateTransferRecipientInput input)
    {

        var builder = Builders<Models.TransferRecipient>.Filter;
        var filter = builder.Eq(x => x.AccountNumber, input.AccountNumber) &
            builder.Eq(x => x.CreatedById, input.CreatedById) &
            builder.Eq(x => x.DeletedAt, null);

        var oldRecipient = await _transferRecipientCollection
            .Find(filter)
            .FirstOrDefaultAsync();

        if (oldRecipient != null)
        {
            throw new HttpRequestException("TransferRecipientAlreadyExists");
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

        var builder = Builders<Models.TransferRecipient>.Filter;
        var filter = builder.Eq(x => x.Id, input.TransferRecipientId) &
            builder.Eq(x => x.CreatedById, input.CreatedById) &
            builder.Eq(x => x.DeletedAt, null);

        var recipient = await _transferRecipientCollection
            .Find(filter)
            .FirstOrDefaultAsync();

        if (recipient is null)
        {
            throw new HttpRequestException("TransferRecipientNotFound");
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
            throw new HttpRequestException("TransferRecipientNotFound");
        }

        return recipient;
    }

    public async Task<Models.Transfer> InitiateTransfer(InitiateTransferInput input)
    {
        // check if you have enough balance
        var user = await _userCollection.Find(x => x.Id == input.CreatedById).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        bool canIPay = user.BookWallet >= input.Amount;
        if (!canIPay)
        {
            throw new HttpRequestException("InsufficientBalance");
        }

        // check if transfer recipient exists
        var recipient = await GetRecipientById(input.TransferRecipientId);

        Models.Transfer? alreadyExistingTransfer = null;

        if (input.Reference != null)
        {
            var doesReferenceAlreadyExist = await _transferCollection.Find(x => x.Reference == input.Reference).FirstOrDefaultAsync();
            if (doesReferenceAlreadyExist is null)
            {
                throw new HttpRequestException("ReferenceIsInvalid");
            }

            alreadyExistingTransfer = doesReferenceAlreadyExist;
        }

        // initiate transfer
        var response = await PaystackTransferConfiguration.Initiate(_appConstantsConfiguration.PaystackSecretKey, new CreateTransferInput
        {
            // Reference = input.Reference,
            Recipient = recipient.RecipientCode,
            Reason = input.Reason ?? "Transferring from my mfoni wallet",
            Amount = input.Amount,
        });

        if (response is null)
        {
            throw new HttpRequestException("InitializingTransferFailed");
        }

        if (alreadyExistingTransfer != null)
        {
            return alreadyExistingTransfer;
        }

        // update user book balance
        var walletTransaction = new Models.WalletTransaction
        {
            UserId = input.CreatedById,
            Type = Models.WalletTransactionType.WITHDRAW,
            Amount = input.Amount,
            ReasonForTransfer = Models.WalletTransactionReasonForTransfer.TRANSFER_TO_BANK_OR_MOMO,
            Status = Models.WalletTransactionStatus.PENDING,
        };
        await _walletTransactionCollection.InsertOneAsync(walletTransaction);

        user.BookWallet -= input.Amount;
        await _userCollection.ReplaceOneAsync(user => user.Id == input.CreatedById, user);

        var transfer = new Models.Transfer
        {
            TransferRecipientId = recipient.Id,
            Reference = response.Reference,
            RecipientCode = recipient.RecipientCode,
            Amount = input.Amount,
            CreatedById = input.CreatedById,
            TransferCode = response.TransferCode,
            Reason = input.Reason ?? "Transferring from my mfoni wallet",
            MetaData = new Models.TransferMetaData
            {
                WalletTransactionId = walletTransaction.Id,
            }
        };

        await _transferCollection.InsertOneAsync(transfer);

        return transfer;

    }

    public async Task VerifySuccessTransfer(string Reference)
    {
        // find transfer by reference
        var transfer = await _transferCollection.Find(x => x.Reference == Reference).FirstOrDefaultAsync();

        if (transfer is null)
        {
            throw new HttpRequestException("TransferNotFound");
        }

        // find wallet transaction by id
        var walletTransaction = await _walletTransactionCollection.Find(x => x.Id == transfer.MetaData.WalletTransactionId).FirstOrDefaultAsync();

        if (walletTransaction is null)
        {
            throw new HttpRequestException("WalletTransactionNotFound");
        }

        // update wallet transaction status
        await _walletTransactionCollection.UpdateOneAsync(
            x => x.Id == walletTransaction.Id,
            Builders<Models.WalletTransaction>.Update
                .Set(x => x.TransferId, transfer.Id)
                .Set(x => x.Status, Models.WalletTransactionStatus.SUCCESSFUL)
                .Set(x => x.SuccessfulAt, DateTime.UtcNow)
                .Set(x => x.UpdatedAt, DateTime.UtcNow)
        );

        var user = await _userCollection.Find(x => x.Id == walletTransaction.UserId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        user.Wallet -= transfer.Amount;
        await _userCollection.ReplaceOneAsync(user => user.Id == transfer.CreatedById, user);

        await _transferCollection.UpdateOneAsync(
            x => x.Id == transfer.Id,
            Builders<Models.Transfer>.Update
                .Set(x => x.Status, Models.TransferStatus.SUCCESSFUL)
                .Set(x => x.SuccessfulAt, DateTime.UtcNow)
                .Set(x => x.UpdatedAt, DateTime.UtcNow)
        );
    }

    public async Task VerifyFailedTransfer(string Reference)
    {
        // find transfer by reference
        var transfer = await _transferCollection.Find(x => x.Reference == Reference).FirstOrDefaultAsync();

        if (transfer is null)
        {
            throw new HttpRequestException("TransferNotFound");
        }

        // find wallet transaction by id
        var walletTransaction = await _walletTransactionCollection.Find(x => x.Id == transfer.MetaData.WalletTransactionId).FirstOrDefaultAsync();

        if (walletTransaction is null)
        {
            throw new HttpRequestException("WalletTransactionNotFound");
        }

        // update wallet transaction status
        await _walletTransactionCollection.UpdateOneAsync(
            x => x.Id == walletTransaction.Id,
            Builders<Models.WalletTransaction>.Update
                .Set(x => x.TransferId, transfer.Id)
                .Set(x => x.Status, Models.WalletTransactionStatus.FAILED)
                .Set(x => x.FailedAt, DateTime.UtcNow)
                .Set(x => x.UpdatedAt, DateTime.UtcNow)
        );

        var user = await _userCollection.Find(x => x.Id == walletTransaction.UserId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        user.BookWallet += transfer.Amount;
        await _userCollection.ReplaceOneAsync(user => user.Id == transfer.CreatedById, user);


        await _transferCollection.UpdateOneAsync(
            x => x.Id == transfer.Id,
            Builders<Models.Transfer>.Update
                .Set(x => x.Status, Models.TransferStatus.FAILED)
                .Set(x => x.FailedAt, DateTime.UtcNow)
                .Set(x => x.UpdatedAt, DateTime.UtcNow)
        );
    }

    public async Task VerifyReverseTransfer(string Reference)
    { }
}