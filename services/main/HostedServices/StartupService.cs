using main.Domains;

namespace main.HostedServices
{
    public class StartUpService : IHostedService
    {
        private readonly AdminWalletService _adminWalletService;
        private readonly CollectionService _collectionService;
        private readonly ExploreSectionService _exploreSectionService;

        public StartUpService(AdminWalletService adminWalletService, CollectionService collectionService,
            ExploreSectionService exploreSectionService
        )
        {
            _adminWalletService = adminWalletService;
            _collectionService = collectionService;
            _exploreSectionService = exploreSectionService;
        }
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _adminWalletService.BootsrapAdminWallet();
            _collectionService.BootstrapCollections();
            await _exploreSectionService.BootstrapExploreSections();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

    }
}