using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public class Admin
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("email")]
    public required string Email { get; set; }

    [BsonElement("password")]
    public required string Password { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<Admin> collection)
    {
        var indexModels = new List<CreateIndexModel<Admin>>
        {
            // Unique index on Email
            new CreateIndexModel<Admin>(
                Builders<Admin>.IndexKeys.Ascending(x => x.Email),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on Name for fast lookups
            new CreateIndexModel<Admin>(
                Builders<Admin>.IndexKeys.Ascending(x => x.Name)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<Admin>(
                Builders<Admin>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}
