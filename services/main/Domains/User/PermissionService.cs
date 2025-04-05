using main.Configuratons;
using main.Domains;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

public class PermissionService
{
    private readonly ILogger<PermissionService> _logger;
    private readonly CollectionService _collectionService;
    private readonly CreatorService _creatorService;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IMongoCollection<WalletTransaction> _walletTransactionsCollection;

    public PermissionService(
        ILogger<PermissionService> logger,
        CreatorService creatorService,
        CollectionService collectionService,
       DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants

    )
    {
        _logger = logger;
        _contentsCollection = databaseConfig.Database.GetCollection<Content>(
            appConstants.Value.CreatorCollection
        );
        _walletTransactionsCollection = databaseConfig.Database.GetCollection<WalletTransaction>(
            appConstants.Value.WalletTransactionCollection
        );

        _creatorService = creatorService;
        _collectionService = collectionService;

        _logger.LogDebug("PermissionService initialized");
    }

    public async Task<Int64> GetMonthlyUploadLimit(GetCreatorDetailedResponse creatorInfo)
    {
        // Get count of contents uploaded this month
        var currentYear = DateTime.UtcNow.Year;
        var currentMonth = DateTime.UtcNow.Month;
        var subscriptionStartDay = creatorInfo.CreatorSubscription.StartedAt.Day;

        var startDateCheck = new DateTime(currentYear, currentMonth, subscriptionStartDay);
        var endDateCheck = startDateCheck.AddMonths(1);

        var builders = new FilterDefinitionBuilder<Content>();
        var filter = builders.And(
            builders.Gte(x => x.CreatedAt, startDateCheck),
            builders.Lt(x => x.CreatedAt, endDateCheck)
        );

        filter &= builders.Eq(x => x.CreatedById, creatorInfo.User.Id);

        var contentsCreatorHasUploaded = await _contentsCollection.CountDocumentsAsync(filter);

        return contentsCreatorHasUploaded;
    }

    public async Task<Int64> GetMonthlyWithdrawalLimit(GetCreatorDetailedResponse creatorInfo)
    {
        // Get count of contents uploaded this month
        var currentYear = DateTime.UtcNow.Year;
        var currentMonth = DateTime.UtcNow.Month;
        var subscriptionStartDay = creatorInfo.CreatorSubscription.StartedAt.Day;

        var startDateCheck = new DateTime(currentYear, currentMonth, subscriptionStartDay);
        var endDateCheck = startDateCheck.AddMonths(1);

        var builders = new FilterDefinitionBuilder<WalletTransaction>();
        var filter = builders.Eq(x => x.UserId, creatorInfo.User.Id);
        filter &= builders.Eq(x => x.Type, WalletTransactionType.WITHDRAW);
        filter &= builders.And(
            builders.Gte(x => x.CreatedAt, startDateCheck),
            builders.Lt(x => x.CreatedAt, endDateCheck)
        );

        // make sure we include only successful and pending transactions
        filter &= builders.In(x => x.Status,
            new[]
            {
                WalletTransactionStatus.SUCCESSFUL,
                WalletTransactionStatus.PENDING,
            }
        );

        var contentsWithdrawn = await _walletTransactionsCollection.FindAsync(filter);
        long count = 0;

        await contentsWithdrawn.ForEachAsync(x =>
        {
            count += x.Amount;
        });

        return count;
    }

    public bool IsACreator(GetCreatorDetailedResponse creatorInfo)
    {
        // check if user is a creator
        if (creatorInfo.User.Role != UserRole.CREATOR || creatorInfo.CreatorSubscription is null)
        {
            return false;
        }

        return true;
    }

    public bool IsAPremiumCreator(GetCreatorDetailedResponse creatorInfo)
    {
        // check if user is a creator
        if (creatorInfo.User.Role != UserRole.CREATOR || creatorInfo.CreatorSubscription is null)
        {
            return false;
        }

        return PermissionsHelper.PremiumPackageTypes.Contains(creatorInfo.CreatorSubscription.PackageType);
    }

    public bool CanCreatorPriceContent(GetCreatorDetailedResponse creatorInfo)
    {
        return IsAPremiumCreator(creatorInfo);
    }

}