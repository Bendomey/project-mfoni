using Microsoft.VisualBasic;

namespace main.Configuratons;

public class AppConstants
{
    public string DatabaseConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string RedisConnectionString { get; set; } = null!;
    public string RabbitMQConnectionString { get; set; } = null!;
    public string AdminCollection { get; init; } = "admins";
    public string AdminWalletCollection { get; init; } = "admin_wallets";
    public string UserCollection { get; init; } = "users";
    public string CollectionCollection { get; init; } = "collections";
    public string CollectionContentCollection { get; init; } = "collection_contents";
    public string ContentCollection { get; init; } = "contents";
    public string ContentLikeCollection { get; init; } = "content_likes";
    public string ContentDownloadCollection { get; init; } = "content_downloads";
    public string ContentPurchaseCollection { get; init; } = "content_purchases";
    public string CreatorApplicatonCollection { get; init; } = "creator_applications";
    public string CreatorCollection { get; init; } = "creators";
    public string ExploreSectionCollection { get; init; } = "explore_sections";
    public string TagCollection { get; init; } = "tags";
    public string ContentReportCaseCollection { get; init; } = "content_report_cases";
    public string TagContentCollection { get; init; } = "tag_contents";
    public string WaitlistCollection { get; init; } = "waitlists";
    public string CreatorSubscriptionCollection { get; init; } = "creator_subscriptions";
    public string CreatorSubscriptionPurchaseCollection { get; init; } = "creator_subscription_purchases";
    public string PaymentCollection { get; init; } = "payments";
    public string SavedCardCollection { get; init; } = "saved_cards";
    public string WalletTransactionCollection { get; init; } = "wallet_transations";
    public string AWSRegion { get; set; } = null!;
    public string BucketName { get; set; } = null!;
    public string AWSRekognitionCollection { get; set; } = null!;
    public string ProcessImageQueueName { get; set; } = null!;
    public string ProcessTextualSearchQueueName { get; set; } = null!;
    public string UserJwtSecret { get; set; } = null!;
    public string AdminJwtSecret { get; set; } = null!;
    public string JwtIssuer { get; set; } = null!;
    public string AWSAccessKey { get; set; } = null!;
    public string AWSSecretKey { get; set; } = null!;
    public string SmsAppId { get; set; } = null!;
    public string SmsAppSecret { get; set; } = null!;
    public string ResendApiKey { get; set; } = null!;
    public string EmailFrom { get; init; } = "Mfoni Notifications <noreply@notifications.mfoni.app>";
    public string RegisterSwaggerDocs { get; set; } = null!;
    public string SentryDSN { get; set; } = null!;
    public string SearchServiceURL { get; set; } = null!;
    public string SearchServiceAuthToken { get; set; } = null!;
    public string WebsiteUrl { get; set; } = "https://mfoni.app";
    public string PaystackSecretKey { get; set; } = null!;
    public string MfoniPaymentEmail { get; set; } = "mfoniapp@gmail.com";
}