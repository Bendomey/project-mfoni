using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public class ContentLike
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("content_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ContentId { get; set; }

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<ContentLike> collection)
    {
        var indexModels = new List<CreateIndexModel<ContentLike>>
        {
            // Index on ContentId for fast lookups
            new CreateIndexModel<ContentLike>(
                Builders<ContentLike>.IndexKeys.Ascending(x => x.ContentId)
            ),

            // Index on UserId for fast lookups
            new CreateIndexModel<ContentLike>(
                Builders<ContentLike>.IndexKeys.Ascending(x => x.UserId)
            ),

            // Unique index on ContentId and UserId
            new CreateIndexModel<ContentLike>(
                Builders<ContentLike>.IndexKeys.Combine(
                    Builders<ContentLike>.IndexKeys.Ascending(x => x.ContentId),
                    Builders<ContentLike>.IndexKeys.Ascending(x => x.UserId)
                ),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<ContentLike>(
                Builders<ContentLike>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}
