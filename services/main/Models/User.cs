using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("role")]
    public required string Role { get; set; } = "CLIENT"; // CLIENT | CREATOR

    [BsonElement("type")]
    public required string Type { get; set; } // FB | Twitter | Google

    [BsonElement("social_id")]
    public string? SocialId { get; set; } // if social returns an id.

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("email")]
    public required string Email { get; set; }

    [BsonElement("user_photo")]
    public string? UserPhoto { get; set; }

    [BsonElement("creator_application_id")]
    public ObjectId? CreatorApplicationId { get; set; } // only set after user is approved as creator

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; }  = DateTime.UtcNow;
}