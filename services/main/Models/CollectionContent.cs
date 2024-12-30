using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class CollectionContentType
{
    public static readonly string CREATOR = "CREATOR";
    public static readonly string TAG = "TAG";
    public static readonly string CONTENT = "CONTENT";
    public static readonly string COLLECTION = "COLLECTION";
}

public class CollectionContent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("collection_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CollectionId { get; set; }

    [BsonElement("type")]
    public required string Type { get; set; }

    [BsonElement("tag_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TagId { get; set; }

    [BsonElement("content_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ContentId { get; set; }

    [BsonElement("creator_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatorId { get; set; }

    [BsonElement("child_collection_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ChildCollectionId { get; set; } // a collection can have a child collections

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}