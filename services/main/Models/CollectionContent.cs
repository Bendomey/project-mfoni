using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class CollectionContent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("collection_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CollectionId { get; set; }

    [BsonIgnore]
    public Collection? Collection { get; set; }

    [BsonElement("content_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ContentId { get; set; }

    [BsonIgnore]
    public Content? Content { get; set; }

    [BsonElement("child_collection_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ChildCollectionId { get; set; } // a collection can have a child collections

    [BsonIgnore]
    public CollectionContent? ChildCollection { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatedById { get; set; }

    [BsonIgnore]
    public User? CreatedBy { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}