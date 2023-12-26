using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class Collection
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("tag_ids")]
    public List<ObjectId>? Tags { get; set; }

    [BsonElement("type")]
    public required string Type { get; set; } = "USER"; // USER | SYSTEM

    [BsonElement("status")]
    public required string Status { get; set; } = "PROCESSING"; // PROCESSING | PROCESSED_WITH_ERRORS | PUBLISHED

    [BsonElement("visibility")]
    public required string Visibility { get; set; } = "PRIVATE"; // PUBLIC | PRIVATE

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    public required ObjectId CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; }  = DateTime.UtcNow;
}