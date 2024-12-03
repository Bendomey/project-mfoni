
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace main.Domains;

public class WalletService
{
    private readonly ILogger<WalletService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<WalletTransaction> _walletTransationCollection;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly AdminWalletService _adminWalletService;
    private readonly IMongoCollection<Models.AdminWallet> _adminWalletCollection;

    public WalletService(
           ILogger<WalletService> logger,
           DatabaseSettings databaseConfig,
           IOptions<AppConstants> appConstants,
        AdminWalletService adminWalletService
       )
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;

        _walletTransationCollection = databaseConfig.Database.GetCollection<WalletTransaction>(
         appConstants.Value.WalletTransactionCollection
        );

        _userCollection = databaseConfig.Database.GetCollection<Models.User>(
            appConstants.Value.UserCollection
        );

        _adminWalletCollection = databaseConfig.Database.GetCollection<Models.AdminWallet>(
            appConstants.Value.AdminWalletCollection
        );

        _adminWalletService = adminWalletService;

        logger.LogDebug("Wallet service initialized");
    }

    public async Task<WalletTransaction> Deposit(WalletDepositInput input)
    {
        string userId = input.UserId;

        if (input.UserId == "SYSTEM")
        {
            var adminWallet = await _adminWalletService.Get();
            if (adminWallet is null)
            {
                throw new Exception("AdminWalletNotFound");
            }

            userId = adminWallet.Id;
        }

        var newWalletTransation = new WalletTransaction
        {
            Amount = input.Amount,
            UserId = userId,
            Type = WalletTransactionType.DEPOSIT,
            ReasonForTransfer = input.ReasonForTransfer,
            PaymentId = input.PaymentId,
        };

        await _walletTransationCollection.InsertOneAsync(newWalletTransation);

        // increase user wallet.
        if (input.UserId == "SYSTEM")
        {
            var adminWallet = await _adminWalletService.Get();
            if (adminWallet is not null)
            {
                adminWallet.Wallet += input.Amount;
                adminWallet.BookWallet += input.Amount;
                await _adminWalletCollection.ReplaceOneAsync(adminWallet => adminWallet.Id == userId, adminWallet);
            }
        }
        else
        {
            var user = await _userCollection.Find(user => user.Id == input.UserId).FirstOrDefaultAsync();
            if (user is not null)
            {
                user.Wallet += input.Amount;
                user.BookWallet += input.Amount;
                await _userCollection.ReplaceOneAsync(user => user.Id == input.UserId, user);
            }
        }

        return newWalletTransation;
    }

    public async Task<WalletTransaction> Withdraw(WalletWithdrawInput input)
    {
        string userId = input.UserId;

        if (input.UserId == "SYSTEM")
        {
            var adminWallet = await _adminWalletService.Get();
            if (adminWallet is null)
            {
                throw new Exception("AdminWalletNotFound");
            }

            userId = adminWallet.Id;
        }

        var newWalletTransation = new WalletTransaction
        {
            Amount = input.Amount,
            UserId = userId,
            Type = WalletTransactionType.WITHDRAW,
            ReasonForTransfer = input.ReasonForTransfer,
        };

        await _walletTransationCollection.InsertOneAsync(newWalletTransation);

        // reduce user wallet.
        if (input.UserId == "SYSTEM")
        {
            var adminWallet = await _adminWalletService.Get();
            if (adminWallet is not null)
            {
                adminWallet.Wallet -= input.Amount;
                adminWallet.BookWallet -= input.Amount;
                await _adminWalletCollection.ReplaceOneAsync(admin => admin.Id == userId, adminWallet);
            }
        }
        else
        {
            var user = await _userCollection.Find(user => user.Id == input.UserId).FirstOrDefaultAsync();
            if (user is not null)
            {
                user.Wallet -= input.Amount;
                user.BookWallet -= input.Amount;
                await _userCollection.ReplaceOneAsync(user => user.Id == input.UserId, user);
            }
        }

        return newWalletTransation;
    }

    public async Task<List<Models.WalletTransaction>> GetWalletTransactions(
    FilterQuery<Models.WalletTransaction> queryFilter,
    GetWalletTransactionsInput input
)
    {
        FilterDefinitionBuilder<Models.WalletTransaction> builder = Builders<Models.WalletTransaction>.Filter;
        var userIdFilter = builder.Eq(wallet => wallet.UserId, input.UserId);
        var typeFilter = builder.Eq(wallet => wallet.Type, input.Type);


        var filters = Builders<WalletTransaction>.Filter.And(userIdFilter);

        if (input.Type is not null)
        {
            filters = Builders<WalletTransaction>.Filter.And(userIdFilter, typeFilter);
        }

        var transactions = await _walletTransationCollection
            .Find(filters)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return transactions ?? [];
    }

    public async Task<long> CountWalletTransactions(GetWalletTransactionsInput input)
    {
        FilterDefinitionBuilder<Models.WalletTransaction> builder = Builders<Models.WalletTransaction>.Filter;
        var userIdFilter = builder.Eq(wallet => wallet.UserId, input.UserId);
        var typeFilter = builder.Eq(wallet => wallet.Type, input.Type);


        var filters = Builders<WalletTransaction>.Filter.And(userIdFilter);

        if (input.Type is not null)
        {
            filters = Builders<WalletTransaction>.Filter.And(userIdFilter, typeFilter);
        }


        long usersCount = await _walletTransationCollection.CountDocumentsAsync(filters);
        return usersCount;
    }

        public async Task<WalletTransaction> GetWalletById(string walletId)
    {
        var walletTransaction = await _walletTransationCollection.Find(application => application.Id == walletId)
            .FirstOrDefaultAsync();

        if (walletTransaction is null)
        {
            throw new HttpRequestException("WalletTransactionNotFound");
        }

        return walletTransaction;
    }


}