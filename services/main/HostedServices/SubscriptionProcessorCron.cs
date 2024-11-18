using main.Domains;

namespace main.HostedServices
{
    public class SubscriptionProcessorCron : IHostedService, IDisposable
    {
        private readonly CreatorService _creatorService;
        private readonly SubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionProcessorCron> _logger;
        private Timer _timer = null;
        private TimeSpan _taskTime = new TimeSpan(0, 0, 0); // Set to 12:00 AM.

        public SubscriptionProcessorCron(SubscriptionService subscriptionService, CreatorService creatorService, ILogger<SubscriptionProcessorCron> logger)
        {
            _subscriptionService = subscriptionService;
            _creatorService = creatorService;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("SubscriptionProcessorCron is starting.");
            ScheduleNextRun();
            return Task.CompletedTask;
        }

        private void ScheduleNextRun()
        {
            var now = DateTime.Now;
            var nextRun = now.Date + _taskTime;

            if (nextRun <= now) // If the time has passed today, schedule for tomorrow.
            {
                nextRun = nextRun.AddDays(1);
            }

            var initialDelay = nextRun - now;

            _logger.LogInformation("Next task scheduled for: {nextRun}", nextRun);

            _timer = new Timer(ExecuteTask, null, initialDelay, Timeout.InfiniteTimeSpan);
        }

        private void ExecuteTask(object state)
        {
            try
            {
                PerformAction();
            }
            finally
            {
                ScheduleNextRun(); // Reschedule for the next day.
            }
        }

        private async void PerformAction()
        {
            try
            {
                var creators = await _creatorService.GetSubscribersDueForRenewal();

                foreach (var creator in creators)
                {
                    await _subscriptionService.RenewSubscription(creator);
                }

            }
            catch (Exception e)
            {
                _logger.LogError($"[SubscriptionProcessorCron] failed. Exception: {e}");
                // Log the exception to sentry.
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("SubscriptionProcessorCron is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }

    }
}