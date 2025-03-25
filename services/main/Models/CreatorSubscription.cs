using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class CreatorSubscriptionPackageType
{
    public static readonly string FREE = "FREE";
    public static readonly string BASIC = "BASIC";
    public static readonly string ADVANCED = "ADVANCED";
}

// Holds trail of all packages a creator has ever activated before.
public class CreatorSubscription
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("creator_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatorId { get; init; }

    [BsonElement("package_type")]
    public required string PackageType { get; init; }

    [BsonElement("started_at")]
    public required DateTime StartedAt { get; init; }

    [BsonElement("ended_at")]
    public DateTime? EndedAt { get; set; }

    [BsonElement("period")]
    public double? Period { get; init; } // pass this only when its a paid package and for how long its paid for.

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<CreatorSubscription> collection)
    {
        var indexModels = new List<CreateIndexModel<CreatorSubscription>>
        {
            // Index on CreatorId for fast lookups
            new CreateIndexModel<CreatorSubscription>(
                Builders<CreatorSubscription>.IndexKeys.Ascending(x => x.CreatorId)
            ),

            // Index on PackageType for fast lookups
            new CreateIndexModel<CreatorSubscription>(
                Builders<CreatorSubscription>.IndexKeys.Ascending(x => x.PackageType)
            ),

            // Index on StartedAt for sorting
            new CreateIndexModel<CreatorSubscription>(
                Builders<CreatorSubscription>.IndexKeys.Descending(x => x.StartedAt)
            ),

            // Index on EndedAt for sorting
            new CreateIndexModel<CreatorSubscription>(
                Builders<CreatorSubscription>.IndexKeys.Descending(x => x.EndedAt)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<CreatorSubscription>(
                Builders<CreatorSubscription>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}
