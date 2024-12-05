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
    public string CreatorApplicatonCollection { get; init; } = "creator_applications";
    public string CreatorCollection { get; init; } = "creators";
    public string TagCollection { get; init; } = "tags";
    public string ContentTagCollection { get; init; } = "content_tags";
    public string WaitlistCollection { get; init; } = "waitlists";
    public string CreatorSubscriptionCollection { get; init; } = "creator_subscriptions";
    public string CreatorSubscriptionPurchaseCollection { get; init; } = "creator_subscription_purchases";
    public string PaymentCollection { get; init; } = "payments";
    public string SavedCardCollection { get; init; } = "saved_cards";
    public string WalletTransactionCollection { get; init; } = "wallet_transations";
    public string BucketName { get; set; } = null!;
    public string AWSRekognitionCollection { get; set; } = null!;
    public string ProcessImageQueueName { get; set; } = null!;
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
}