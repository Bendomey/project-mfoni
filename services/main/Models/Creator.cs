using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class CreatorStatus
{
    public static readonly string ACTIVE = "ACTIVE";
    public static readonly string SUSPENDED = "SUSPENDED";
}

public class Creator
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("creator_application_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatorApplicationId { get; init; }

    [BsonElement("status")]
    public string Status { get; set; } = CreatorStatus.ACTIVE;

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; init; }

    [BsonElement("username")]
    public string? Username { get; set; }

    [BsonElement("social_media")]
    public SocialMedia[] SocialMedia { get; set; } = [];

    [BsonElement("commission")]
    public double Commission { get; set; } = 0;

    [BsonElement("book_commission")]
    public double BookCommission { get; set; } = 0;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SocialMedia
{
    [BsonElement("platform")]
    public required string Platform { get; set; } // FACEBOOK | TWITTER | GOOGLE | INSTAGRAM | YOUTUBE

    [BsonElement("handle")]
    public required string Handle { get; set; }
}