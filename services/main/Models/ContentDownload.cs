using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class ContentDownloadType
{
    public static readonly string SMALL = "SMALL";
    public static readonly string MEDIUM = "MEDIUM";
    public static readonly string LARGE = "LARGE";
    public static readonly string ORIGINAL = "ORIGINAL";
}

public class ContentDownload
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("type")]
    public required string Type { get; set; }

    [BsonElement("content_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ContentId { get; set; }

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<ContentDownload> collection)
    {
        var indexModels = new List<CreateIndexModel<ContentDownload>>
        {
            // Index on ContentId for fast lookups
            new CreateIndexModel<ContentDownload>(
                Builders<ContentDownload>.IndexKeys.Ascending(x => x.ContentId)
            ),

            // Index on UserId for fast lookups
            new CreateIndexModel<ContentDownload>(
                Builders<ContentDownload>.IndexKeys.Ascending(x => x.UserId)
            ),

            // Index on Type for fast lookups
            new CreateIndexModel<ContentDownload>(
                Builders<ContentDownload>.IndexKeys.Ascending(x => x.Type)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<ContentDownload>(
                Builders<ContentDownload>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}