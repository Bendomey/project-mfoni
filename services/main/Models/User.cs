using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    public required string Role { get; set; } = "CLIENT"; // CLIENT | CREATOR

    public required string Type { get; set; } // FB | Twitter | Google

    public string? SocialId { get; set; } // if social returns an id.

    public required string Name { get; set; }

    public required string Email { get; set; }

    public string? UserPhoto { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; }  = DateTime.UtcNow;
}