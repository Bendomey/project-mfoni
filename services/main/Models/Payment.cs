using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class PaymentStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
    public static readonly string CANCELLED = "CANCELLED";
}

public static class PaymentMetaDataOrigin
{
    public static readonly string ContentPurchase = "ContentPurchase";
    public static readonly string WalletTopup = "WalletTopup";
}
// Base Payment model for one time payments.
public class Payment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("reference")]
    public required string Reference { get; init; }

    [BsonElement("access_code")]
    public string? AccessCode { get; init; }

    [BsonElement("channel")]
    public string? Channel { get; init; }

    [BsonElement("authorization_url")]
    public string? AuthorizationUrl { get; init; }

    [BsonElement("amount")]
    public required Int64 Amount { get; init; }

    [BsonElement("status")]
    public string Status { get; init; } = PaymentStatus.PENDING;

    [BsonElement("successful_at")]
    public DateTime? SuccessfulAt { get; set; }

    [BsonElement("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    [BsonElement("failed_at")]
    public DateTime? FailedAt { get; set; }

    [BsonElement("error_obj")]
    public PaymentError? ErrorObj { get; init; }

    [BsonElement("metadata")]
    public required PaymentMetaData MetaData { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<Payment> collection)
    {
        var indexModels = new List<CreateIndexModel<Payment>>
        {
            // Index on Reference for fast lookups
            new CreateIndexModel<Payment>(
                Builders<Payment>.IndexKeys.Ascending(x => x.Reference),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on Status for fast lookups
            new CreateIndexModel<Payment>(
                Builders<Payment>.IndexKeys.Ascending(x => x.Status)
            ),

            // Index on MetaData.Origin for fast lookups
            new CreateIndexModel<Payment>(
                Builders<Payment>.IndexKeys.Ascending(x => x.MetaData.Origin)
            ),

            // Index on MetaData.ContentPurchaseId for fast lookups
            new CreateIndexModel<Payment>(
                Builders<Payment>.IndexKeys.Ascending(x => x.MetaData.ContentPurchaseId)
            ),

            // Index on MetaData.WalletId for fast lookups
            new CreateIndexModel<Payment>(
                Builders<Payment>.IndexKeys.Ascending(x => x.MetaData.WalletId)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<Payment>(
                Builders<Payment>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };
        await collection.Indexes.CreateManyAsync(indexModels);
    }
}


public class PaymentMetaData
{
    [BsonElement("origin")]
    public required string Origin { get; init; } // ContentPurchase | WalletTopup

    [BsonElement("content_purchase_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ContentPurchaseId { get; init; }

    [BsonElement("wallet_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WalletId { get; init; }
}

public class PaymentError
{
    [BsonElement("obj")]
    public string? Obj { get; init; }

    [BsonElement("message")]
    public string? Message { get; init; }
}