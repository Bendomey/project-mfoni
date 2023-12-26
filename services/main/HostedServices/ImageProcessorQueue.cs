using main.Domains;

namespace main.HostedServices
{
    public class ConsumerHostedService : BackgroundService
    {
        private readonly ProcessIndexContent _consumerService;

        public ConsumerHostedService(ProcessIndexContent consumerService)
        {
            _consumerService = consumerService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumerService.ReadMessages();
        }
    }
}