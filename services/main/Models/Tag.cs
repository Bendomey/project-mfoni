using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public class Tag
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("slug")]
    public required string Slug { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("is_featured")]
    public bool IsFeatured { get; set; } = false;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_admin_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedByAdminId { get; set; }

    [BsonElement("created_by_user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedByUserId { get; set; }

    public static async Task EnsureIndexesAsync(IMongoCollection<Tag> collection)
    {
        var indexModels = new List<CreateIndexModel<Tag>>
        {
            // Unique index on Slug
            new CreateIndexModel<Tag>(
                Builders<Tag>.IndexKeys.Ascending(x => x.Slug),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on Name for fast lookups
            new CreateIndexModel<Tag>(
                Builders<Tag>.IndexKeys.Ascending(x => x.Name)
            ),

            // Index on IsFeatured for filtering
            new CreateIndexModel<Tag>(
                Builders<Tag>.IndexKeys.Ascending(x => x.IsFeatured)
            ),

            // Index on CreatedByAdminId for filtering
            new CreateIndexModel<Tag>(
                Builders<Tag>.IndexKeys.Ascending(x => x.CreatedByAdminId)
            ),

            // Index on CreatedByUserId for filtering
            new CreateIndexModel<Tag>(
                Builders<Tag>.IndexKeys.Ascending(x => x.CreatedByUserId)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<Tag>(
                Builders<Tag>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}