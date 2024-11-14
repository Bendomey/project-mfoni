using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class UserStatus
{
    public static readonly string ACTIVE = "ACTIVE";
    public static readonly string SUSPENDED = "SUSPENDED";
}

public static class UserRole
{
    public static readonly string CLIENT = "CLIENT";
    public static readonly string CREATOR = "CREATOR";
}

public static class UserProvider
{
    public static readonly string FACEBOOK = "FACEBOOK";
    public static readonly string TWITTER = "TWITTER";
    public static readonly string GOOGLE = "GOOGLE";
}

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("status")]
    public string Status { get; set; } = UserStatus.ACTIVE;

    [BsonElement("role")]
    public string? Role { get; set; }

    [BsonElement("provider")]
    public required string Provider { get; set; } // FACEBOOK | TWITTER | GOOGLE

    [BsonElement("oauth_id")]
    public required string OAuthId { get; set; } // if social returns an id.

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("email_verified_at")]
    public DateTime? EmailVerifiedAt { get; set; }

    [BsonElement("phone_number")]
    public string? PhoneNumber { get; set; }

    [BsonElement("phone_number_verified_at")]
    public DateTime? PhoneNumberVerifiedAt { get; set; }

    [BsonElement("photo")]
    public string? Photo { get; set; }

    [BsonElement("wallet")]
    public double Wallet { get; set; } = 0;

    [BsonElement("book_wallet")]
    public double BookWallet { get; set; } = 0;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
