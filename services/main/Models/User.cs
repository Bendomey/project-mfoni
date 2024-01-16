using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("role")]
    public string Role { get; set; } = "CLIENT"; // CLIENT | CREATOR

    [BsonElement("provider")]
    public required string Provider { get; set; } // FACEBOOK | TWITTER | GOOGLE

    [BsonElement("oauth_id")]
    public required string OAuthId { get; set; } // if social returns an id.

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("username")]
    public string? Username { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("phone_number")]
    public string? PhoneNumber { get; set; }

    [BsonElement("verified_phone_number_at")]
    public DateTime? VerifiedPhoneNumberAt { get; set; }

    [BsonElement("photo")]
    public string? Photo { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("creator_application_id")]
    public string? CreatorApplication { get; set; } // only set after user is approved as creator

    [BsonElement("account_setup_at")]
    public DateTime? AccountSetupAt { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}