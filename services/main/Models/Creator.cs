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
    public required string Username { get; set; }

    [BsonElement("social_media")]
    public SocialMedia[] SocialMedia { get; set; } = [];

    [BsonElement("interests")]
    public string[] Interests { get; set; } = [];

    [BsonElement("about")]
    public string? About { get; set; }

    [BsonElement("followers")]
    public long Followers { get; set; } = 0;

    [BsonElement("address")]
    public string Address { get; set; } = "Ghana";

    [BsonElement("website_disabled_at")]
    public DateTime? WebsiteDisabledAt { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SocialMedia
{
    [BsonElement("platform")]
    public required string Platform { get; set; } // FACEBOOK | TWITTER | GOOGLE | INSTAGRAM | YOUTUBE | WEBSITE

    [BsonElement("handle")]
    public required string Handle { get; set; }
}