using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class CreatorPackageType
{
    public static readonly string FREE = "FREE";
    public static readonly string BASIC = "BASIC";
    public static readonly string ADVANCED = "ADVANCED";
}

public static class CreatorPackageStatus
{
    public static readonly string ACTIVE = "ACTIVE";
    public static readonly string DEACTIVATED = "DEACTIVATED";
}

public class CreatorPackage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("creator_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatorId { get; init; }

    [BsonElement("package_type")]
    public required string PackageType { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = CreatorPackageStatus.ACTIVE;

    [BsonElement("deactivated_at")]
    public DateTime? DeactivatedAt { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
