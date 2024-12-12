using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class CollectionCreatedByRole
{
    public static readonly string USER = "USER";
    public static readonly string SYSTEM = "SYSTEM";
}

public static class CollectionVisibility
{
    public static readonly string PUBLIC = "PUBLIC";
    public static readonly string PRIVATE = "PRIVATE";
}

public class Collection
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("slug")]
    public required string Slug { get; set; }

    [BsonElement("contents_count")]
    public int ContentsCount { get; set; } = 0;

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("created_by_role")]
    public string CreatedByRole { get; set; } = CollectionCreatedByRole.SYSTEM;

    [BsonElement("visibility")]
    public string Visibility { get; set; } = CollectionVisibility.PRIVATE;

    [BsonElement("is_custom")]
    public bool IsCustom { get; set; } = false;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}