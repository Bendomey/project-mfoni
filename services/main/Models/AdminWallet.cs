using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public class AdminWallet
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("wallet")]
    public Int64 Wallet { get; set; } = 0;

    [BsonElement("book_wallet")]
    public Int64 BookWallet { get; set; } = 0;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<AdminWallet> collection)
    {
        var indexModels = new List<CreateIndexModel<AdminWallet>>
        {
            // Index on CreatedAt for sorting
            new CreateIndexModel<AdminWallet>(
                Builders<AdminWallet>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}
