using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class MfoniPackageStatus
{
    public static readonly string ACTIVE = "MfoniPackage.Status.Active";
    public static readonly string INACTIVE = "MfoniPackage.Status.Inactive";
}

public static class MfoniPackageCode
{
    public static readonly string FREE = "MfoniPackage.Free";
    public static readonly string BASIC = "MfoniPackage.Basic";
    public static readonly string ADVANCED = "MfoniPackage.Advanced";
}

public class MfoniPackage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("code")]
    public required string Code { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("amount")]
    public required Int64 Amount { get; set; } // Pesewas equivalent. 0 for free

    [BsonElement("currency")]
    public required string Currency { get; set; } = "GHS";

    [BsonElement("features")]
    public required List<MfoniPackageFeature> Features { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = MfoniPackageStatus.INACTIVE;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<MfoniPackage> collection)
    {
        var indexModels = new List<CreateIndexModel<MfoniPackage>>
        {
            // Index on Code for fast lookups
            new CreateIndexModel<MfoniPackage>(
                Builders<MfoniPackage>.IndexKeys.Ascending(x => x.Code)
            ),

            // Index on Status for fast lookups
            new CreateIndexModel<MfoniPackage>(
                Builders<MfoniPackage>.IndexKeys.Ascending(x => x.Status)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<MfoniPackage>(
                Builders<MfoniPackage>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}


public class MfoniPackageFeatureType
{
    public static readonly string LIMIT = "MfoniPackage.Feature.Type.Limit"; // A limit value. 1, 2, 3 etc
    public static readonly string BOOLEAN = "MfoniPackage.Feature.Type.Boolean"; // true or false
    public static readonly string NUMERIC = "MfoniPackage.Feature.Type.Numeric"; // 1, 2, 3 etc
    public static readonly string LEVEL = "MfoniPackage.Feature.Type.Level"; // none, basic, advanced etc
}


public static class MfoniPackageFeatureCode
{
    public static readonly string UPLOAD_LIMIT = "MfoniPackage.Feature.UploadLimit"; // Number of uploads allowed per month
    public static readonly string PRICE_IMAGES = "MfoniPackage.Feature.PriceImages"; // Can price images
    public static readonly string PORTFOLIO_CUSTOM = "MfoniPackage.Feature.PortfolioCustom"; // Can customize portfolio
    public static readonly string CONTENT_ON_PORTFOLIO = "MfoniPackage.Feature.ContentOnPortfolio"; // number of content pieces on portfolio
    public static readonly string CONTACT_LINKS = "MfoniPackage.Feature.ContactLinks"; // Show contact & socials on portfolio
    public static readonly string EARNINGS_ANALYTICS = "MfoniPackage.Feature.EarningsAnalytics"; // Earnings analytics
    public static readonly string WITHDRAWAL_LIMIT = "MfoniPackage.Feature.WithdrawalLimit"; // Max withdrawal per month
    public static readonly string PRIORITY_ADS = "MfoniPackage.Feature.PriorityAds"; // Higher priority in ads
    public static readonly string EARLY_ACCESS_TO_FEATURES = "MfoniPackage.Feature.EarlyAccessToFeatures"; // Early access to new features
}


public class MfoniPackageFeature
{
    [BsonElement("code")]
    public required string Code { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("type")]
    public required string Type { get; set; }

    [BsonElement("value")]
    public required string Value { get; set; }
}