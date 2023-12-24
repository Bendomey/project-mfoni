using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class CollectionContent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("collection_id")]
    public required ObjectId CollectionId { get; set; }

    [BsonElement("content_id")]
    public ObjectId? ContentId { get; set; }

    [BsonElement("child_collection_id")]
    public ObjectId? ChildCollectionId { get; set; } // a collection can have a child collections

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    public required ObjectId CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}