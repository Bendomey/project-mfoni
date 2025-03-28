using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class TransferRecipientType
{
    public static readonly string MOBILE_MONEY = "mobile_money";
    public static readonly string BANK = "ghipss";
}


public class TransferRecipient
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonId]
    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatedById { get; set; } // user id

    [BsonElement("type")]
    public required string Type { get; set; }

    [BsonElement("recipient_code")]
    public required string RecipientCode { get; set; }

    [BsonElement("currency")]
    public string Currency { get; set; } = "GHS";

    [BsonElement("account_number")]
    public required string AccountNumber { get; set; }

    [BsonElement("account_name")]
    public required string AccountName { get; set; }

    [BsonElement("bank_name")]
    public required string BankName { get; set; }

    [BsonElement("bank_code")]
    public required string BankCode { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<TransferRecipient> collection)
    {
        var indexModels = new List<CreateIndexModel<TransferRecipient>>
        {
            // Index on Type for fast lookups
            new CreateIndexModel<TransferRecipient>(
                Builders<TransferRecipient>.IndexKeys.Ascending(x => x.Type)
            ),
            
            // Index on RecipientCode for fast lookups
            new CreateIndexModel<TransferRecipient>(
                Builders<TransferRecipient>.IndexKeys.Ascending(x => x.RecipientCode)
            ),

            // Index on AccountNumber for fast lookups
            new CreateIndexModel<TransferRecipient>(
                Builders<TransferRecipient>.IndexKeys.Ascending(x => x.AccountNumber)
            ),

            // Index on BankCode for fast lookups
            new CreateIndexModel<TransferRecipient>(
                Builders<TransferRecipient>.IndexKeys.Ascending(x => x.BankCode)
            ),
            
            // Index on CreatedById for filtering
            new CreateIndexModel<TransferRecipient>(
                Builders<TransferRecipient>.IndexKeys.Ascending(x => x.CreatedById)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<TransferRecipient>(
                Builders<TransferRecipient>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}