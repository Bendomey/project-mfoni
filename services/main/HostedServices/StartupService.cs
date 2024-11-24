using main.Domains;

namespace main.HostedServices
{
    public class StartUpService : IHostedService
    {
        private readonly AdminWalletService _adminWalletService;

        public StartUpService(AdminWalletService adminWalletService)
        {
            _adminWalletService = adminWalletService;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _adminWalletService.BootsrapAdminWallet();
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

    }
}