using main.Domains;

namespace main.HostedServices
{
    public class StartUpService : IHostedService
    {
        private readonly AdminWalletService _adminWalletService;
        private readonly CollectionService _collectionService;

        public StartUpService(AdminWalletService adminWalletService, CollectionService collectionService)
        {
            _adminWalletService = adminWalletService;
            _collectionService = collectionService;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _adminWalletService.BootsrapAdminWallet();
            _collectionService.BootstrapCollections();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

    }
}