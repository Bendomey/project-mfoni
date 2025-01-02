using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class Tag
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("slug")]
    public required string Slug { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("is_featured")]
    public bool IsFeatured { get; set; } = false;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_admin_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedByAdminId { get; set; }

    [BsonElement("created_by_user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedByUserId { get; set; }
}