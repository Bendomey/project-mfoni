namespace main.Configuratons;

public class AppConstants
{
    public string DatabaseConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string RedisConnectionString { get; set; } = null!;
    public string RabbitMQConnectionString { get; set; } = null!;
    public string AdminCollection { get; set; } = null!;
    public string UserCollection { get; set; } = null!;
    public string CollectionCollection { get; set; } = null!;
    public string CollectionContentCollection { get; set; } = null!;
    public string ContentCollection { get; set; } = null!;
    public string CreatorApplicatonCollection { get; set; } = null!;
    public string TagCollection { get; set; } = null!;
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

}