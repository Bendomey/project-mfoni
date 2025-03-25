using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

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

    public static async Task EnsureIndexesAsync(IMongoCollection<CollectionContent> collection)
    {
        var indexModels = new List<CreateIndexModel<CollectionContent>>
        {
            // Index on CollectionId for fast lookups
            new CreateIndexModel<CollectionContent>(
                Builders<CollectionContent>.IndexKeys.Ascending(x => x.CollectionId)
            ),

            // Index on Type for fast lookups
            new CreateIndexModel<CollectionContent>(
                Builders<CollectionContent>.IndexKeys.Ascending(x => x.Type)
            ),

            // Index on TagId for fast lookups
            new CreateIndexModel<CollectionContent>(
                Builders<CollectionContent>.IndexKeys.Ascending(x => x.TagId)
            ),

            // Index on ContentId for fast lookups
            new CreateIndexModel<CollectionContent>(
                Builders<CollectionContent>.IndexKeys.Ascending(x => x.ContentId)
            ),

            // Index on CreatorId for fast lookups
            new CreateIndexModel<CollectionContent>(
                Builders<CollectionContent>.IndexKeys.Ascending(x => x.CreatorId)
            ),

            // Index on ChildCollectionId for fast lookups
            new CreateIndexModel<CollectionContent>(
                Builders<CollectionContent>.IndexKeys.Ascending(x => x.ChildCollectionId)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<CollectionContent>(
                Builders<CollectionContent>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}