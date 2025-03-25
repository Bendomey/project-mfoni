using main.Configuratons;
using main.Domains;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.HostedServices
{
    public class StartUpService : IHostedService
    {
        private readonly AdminWalletService _adminWalletService;
        private readonly CollectionService _collectionService;
        private readonly ExploreSectionService _exploreSectionService;
        private readonly DatabaseSettings _databaseConfig;
        private readonly AppConstants _appConstantsConfiguration;

        public StartUpService(AdminWalletService adminWalletService, CollectionService collectionService,
            ExploreSectionService exploreSectionService,
            IOptions<AppConstants> appConstants,
            DatabaseSettings databaseConfig
        )
        {
            _appConstantsConfiguration = appConstants.Value;
            _databaseConfig = databaseConfig;

            _adminWalletService = adminWalletService;
            _collectionService = collectionService;
            _exploreSectionService = exploreSectionService;
        }
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await ResolveIndexes();

            await _adminWalletService.BootsrapAdminWallet();
            _collectionService.BootstrapCollections();
            await _exploreSectionService.BootstrapExploreSections();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        private async Task ResolveIndexes()
        {
            var adminCollection = _databaseConfig.Database.GetCollection<Models.Admin>(_appConstantsConfiguration.AdminCollection);
            var adminWalletCollection = _databaseConfig.Database.GetCollection<Models.AdminWallet>(_appConstantsConfiguration.AdminWalletCollection);
            var collectionCollection = _databaseConfig.Database.GetCollection<Models.Collection>(_appConstantsConfiguration.CollectionCollection);
            var collectionContentCollection = _databaseConfig.Database.GetCollection<Models.CollectionContent>(_appConstantsConfiguration.CollectionContentCollection);
            var contentCollection = _databaseConfig.Database.GetCollection<Models.Content>(_appConstantsConfiguration.ContentCollection);
            var contentDownloadCollection = _databaseConfig.Database.GetCollection<Models.ContentDownload>(_appConstantsConfiguration.ContentDownloadCollection);
            var contentLikeCollection = _databaseConfig.Database.GetCollection<Models.ContentLike>(_appConstantsConfiguration.ContentLikeCollection);
            var contentPurchaseCollection = _databaseConfig.Database.GetCollection<Models.ContentPurchase>(_appConstantsConfiguration.ContentPurchaseCollection);
            var creatorCollection = _databaseConfig.Database.GetCollection<Models.Creator>(_appConstantsConfiguration.CreatorCollection);
            var creatorApplicationCollection = _databaseConfig.Database.GetCollection<Models.CreatorApplication>(_appConstantsConfiguration.CreatorApplicatonCollection);
            var creatorSubscriptionCollection = _databaseConfig.Database.GetCollection<Models.CreatorSubscription>(_appConstantsConfiguration.CreatorSubscriptionCollection);
            var creatorSubscriptionPurchaseCollection = _databaseConfig.Database.GetCollection<Models.CreatorSubscriptionPurchase>(_appConstantsConfiguration.CreatorSubscriptionPurchaseCollection);
            var exploreSectionCollection = _databaseConfig.Database.GetCollection<Models.ExploreSection>(_appConstantsConfiguration.ExploreSectionCollection);
            var paymentCollection = _databaseConfig.Database.GetCollection<Models.Payment>(_appConstantsConfiguration.PaymentCollection);
            var reportContentCaseCollection = _databaseConfig.Database.GetCollection<Models.ReportContentCase>(_appConstantsConfiguration.ContentReportCaseCollection);
            var savedCardCollection = _databaseConfig.Database.GetCollection<Models.SavedCard>(_appConstantsConfiguration.SavedCardCollection);
            var tagCollection = _databaseConfig.Database.GetCollection<Models.Tag>(_appConstantsConfiguration.TagCollection);
            var tagContentCollection = _databaseConfig.Database.GetCollection<Models.TagContent>(_appConstantsConfiguration.TagContentCollection);
            var userCollection = _databaseConfig.Database.GetCollection<Models.User>(_appConstantsConfiguration.UserCollection);
            var waitlistCollection = _databaseConfig.Database.GetCollection<Models.Waitlist>(_appConstantsConfiguration.WaitlistCollection);
            var walletTransactionCollection = _databaseConfig.Database.GetCollection<Models.WalletTransaction>(_appConstantsConfiguration.WalletTransactionCollection);

            await Models.Admin.EnsureIndexesAsync(adminCollection);
            await Models.AdminWallet.EnsureIndexesAsync(adminWalletCollection);
            await Models.Collection.EnsureIndexesAsync(collectionCollection);
            await Models.CollectionContent.EnsureIndexesAsync(collectionContentCollection);
            await Models.Content.EnsureIndexesAsync(contentCollection);
            await Models.ContentDownload.EnsureIndexesAsync(contentDownloadCollection);
            await Models.ContentLike.EnsureIndexesAsync(contentLikeCollection);
            await Models.ContentPurchase.EnsureIndexesAsync(contentPurchaseCollection);
            await Models.Creator.EnsureIndexesAsync(creatorCollection);
            await Models.CreatorApplication.EnsureIndexesAsync(creatorApplicationCollection);
            await Models.CreatorSubscription.EnsureIndexesAsync(creatorSubscriptionCollection);
            await Models.CreatorSubscriptionPurchase.EnsureIndexesAsync(creatorSubscriptionPurchaseCollection);
            await Models.ExploreSection.EnsureIndexesAsync(exploreSectionCollection);
            await Models.Payment.EnsureIndexesAsync(paymentCollection);
            await Models.ReportContentCase.EnsureIndexesAsync(reportContentCaseCollection);
            await Models.SavedCard.EnsureIndexesAsync(savedCardCollection);
            await Models.Tag.EnsureIndexesAsync(tagCollection);
            await Models.TagContent.EnsureIndexesAsync(tagContentCollection);
            await Models.User.EnsureIndexesAsync(userCollection);
            await Models.Waitlist.EnsureIndexesAsync(waitlistCollection);
            await Models.WalletTransaction.EnsureIndexesAsync(walletTransactionCollection);
        }
    }
}