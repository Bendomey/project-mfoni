using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class ExploreSectionType
{
    public static readonly string TAG = "TAG";
    public static readonly string COLLECTION = "COLLECTION";
    public static readonly string CREATOR = "CREATOR";
    public static readonly string CONTENT = "CONTENT";
}

public static class ExploreSectionVisibility
{
    public static readonly string PUBLIC = "PUBLIC";
    public static readonly string PRIVATE = "PRIVATE";
}

public class ExploreSection
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("visibility")]
    public string Visibility { get; set; } = ExploreSectionVisibility.PRIVATE;

    [BsonElement("type")]
    public required string Type { get; set; }

    [BsonElement("endpoint")]
    public required string Endpoint { get; set; }

    [BsonElement("title")]
    public required string Title { get; set; }

    [BsonElement("sort")]
    public required int Sort { get; set; }

    [BsonElement("see_more_pathname")]
    public string? SeeMorePathname { get; set; }

    [BsonElement("ensure_auth")]
    public bool EnsureAuth { get; set; } = false;

    [BsonElement("created_by_id")]
    public string? CreatedById { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
