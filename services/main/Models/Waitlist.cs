using main.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class Waitlist
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; init; } = null!;

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("phone_number")]
    public required string PhoneNumber { get; init; }

    [BsonElement("email")]
    public string? Email { get; init; }

    [BsonElement("type")]
    public required string Type { get; set; } = UserRole.CLIENT;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; init; } = DateTime.UtcNow;

}