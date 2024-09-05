namespace main.Configuratons;

public class AppConstants
{
    public string DatabaseConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string RedisConnectionString { get; set; } = null!;
    public string RabbitMQConnectionString { get; set; } = null!;
    public string AdminCollection { get; init; } = "admins";
    public string UserCollection { get; init; } = "users";
    public string CollectionCollection { get; init; } = "collections";
    public string CollectionContentCollection { get; init; } = "collection_contents";
    public string ContentCollection { get; init; } = "contents";
    public string CreatorApplicatonCollection { get; init; } = "creator_applications";
    public string TagCollection { get; init; } = "tags";
    public string WaitlistCollection { get; init; } = "waitlists";
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

}