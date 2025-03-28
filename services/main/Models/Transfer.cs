using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class TransferStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
    public static readonly string REVERSED = "REVERSED";
}

public class Transfer
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatedById { get; set; }

    [BsonElement("transfer_recipient_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string TransferRecipientId { get; set; }

    [BsonElement("reference")]
    public required string Reference { get; set; }

    [BsonElement("amount")]
    public required Int64 Amount { get; set; }

    [BsonElement("recipient_code")]
    public required string RecipientCode { get; set; }

    [BsonElement("transfer_code")]
    public required string TransferCode { get; set; }

    [BsonElement("reason")]
    public required string Reason { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = TransferStatus.PENDING;

    [BsonElement("successful_at")]
    public DateTime? SuccessfulAt { get; set; }

    [BsonElement("failed_at")]
    public DateTime? FailedAt { get; set; }

    [BsonElement("reversed_at")]
    public DateTime? ReversedAt { get; set; }

    [BsonElement("metadata")]
    public required TransferMetaData MetaData { get; init; }

    [BsonElement("error_obj")]
    public TransferError? ErrorObj { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<Transfer> collection)
    {
        var indexModels = new List<CreateIndexModel<Transfer>>
        {
            // Index on Status for fast lookups
            new CreateIndexModel<Transfer>(
                Builders<Transfer>.IndexKeys.Ascending(x => x.Status)
            ),

            // Index on Reference for fast lookups
            new CreateIndexModel<Transfer>(
                Builders<Transfer>.IndexKeys.Ascending(x => x.Reference),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on TransferCode for fast lookups
            new CreateIndexModel<Transfer>(
                Builders<Transfer>.IndexKeys.Ascending(x => x.TransferCode),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on TransferRecipientId for fast lookups
            new CreateIndexModel<Transfer>(
                Builders<Transfer>.IndexKeys.Ascending(x => x.TransferRecipientId)
            ),

            // Index on RecipientCode for fast lookups
            new CreateIndexModel<Transfer>(
                Builders<Transfer>.IndexKeys.Ascending(x => x.RecipientCode)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<Transfer>(
                Builders<Transfer>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}

public class TransferMetaData
{
    [BsonElement("wallet_transaction_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WalletTransactionId { get; init; }
}

public class TransferError
{
    [BsonElement("obj")]
    public string? Obj { get; init; }

    [BsonElement("message")]
    public string? Message { get; init; }
}