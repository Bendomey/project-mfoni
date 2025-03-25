using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public class TagContent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("content_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ContentId { get; set; }

    [BsonElement("tag_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string TagId { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<TagContent> collection)
    {
        var indexModels = new List<CreateIndexModel<TagContent>>
        {
            // Index on ContentId for fast lookups
            new CreateIndexModel<TagContent>(
                Builders<TagContent>.IndexKeys.Ascending(x => x.ContentId)
            ),

            // Index on TagId for fast lookups
            new CreateIndexModel<TagContent>(
                Builders<TagContent>.IndexKeys.Ascending(x => x.TagId)
            ),

            // Compound index on ContentId and TagId for uniqueness
            new CreateIndexModel<TagContent>(
                Builders<TagContent>.IndexKeys.Combine(
                    Builders<TagContent>.IndexKeys.Ascending(x => x.ContentId),
                    Builders<TagContent>.IndexKeys.Ascending(x => x.TagId)
                ),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<TagContent>(
                Builders<TagContent>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}