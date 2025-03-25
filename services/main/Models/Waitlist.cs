using main.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public class Waitlist
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; init; } = null!;

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("phone_number")]
    public required string PhoneNumber { get; init; }

    [BsonElement("email")]
    public string? Email { get; init; }

    [BsonElement("type")]
    public required string Type { get; set; } = UserRole.CLIENT;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; init; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<Waitlist> collection)
    {
        var indexModels = new List<CreateIndexModel<Waitlist>>
        {
            // Index on Email for fast lookups
            new CreateIndexModel<Waitlist>(
                Builders<Waitlist>.IndexKeys.Ascending(x => x.Email),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on Name for fast lookups
            new CreateIndexModel<Waitlist>(
                Builders<Waitlist>.IndexKeys.Ascending(x => x.Name)
            ),

            // Index on PhoneNumber for fast lookups
            new CreateIndexModel<Waitlist>(
                Builders<Waitlist>.IndexKeys.Ascending(x => x.PhoneNumber)
            ),

            // Index on Type for fast lookups
            new CreateIndexModel<Waitlist>(
                Builders<Waitlist>.IndexKeys.Ascending(x => x.Type)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<Waitlist>(
                Builders<Waitlist>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }

}