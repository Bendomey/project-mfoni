using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class ContentPurchaseType
{
    public static readonly string ONE_TIME = "ONE_TIME"; // using card/momo/any other instant payment method.
    public static readonly string WALLET = "WALLET";
    public static readonly string SAVED_CARD = "SAVED_CARD";
}

public static class ContentPurchaseStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
    public static readonly string CANCELLED = "CANCELLED";
}

// On successful content purchase, save the deets of the purchase.
public class ContentPurchase
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; init; }

    [BsonElement("content_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ContentId { get; init; }

    // Should hold the main content amount at the time of purchase.
    [BsonElement("amount")]
    public required Int64 Amount { get; init; }

    // TODO: work on any discount.

    [BsonElement("type")]
    public required string Type { get; init; }

    // if payment was done with user's card, log it here.
    [BsonElement("saved_card_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? SavedCardId { get; set; }

    // if payment was done with user's wallet, log it here.
    [BsonElement("wallet_from")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WalletFrom { get; set; }

    [BsonElement("wallet_to")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WalletTo { get; set; }

    // only set when payment is successful.
    [BsonElement("payment_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? PaymentId { get; set; }

    [BsonElement("status")]
    public string Status { get; init; } = ContentPurchaseStatus.PENDING;

    [BsonElement("successful_at")]
    public DateTime? SuccessfulAt { get; set; }

    [BsonElement("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    [BsonElement("failed_at")]
    public DateTime? FailedAt { get; set; }

    [BsonElement("error_obj")]
    public ContentPurchaseError? ErrorObj { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<ContentPurchase> collection)
    {
        var indexModels = new List<CreateIndexModel<ContentPurchase>>
        {
            // Index on UserId for fast lookups
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Ascending(x => x.UserId)
            ),

            // Index on ContentId for fast lookups
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Ascending(x => x.ContentId)
            ),

            // Index on Status for fast lookups
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Ascending(x => x.Status)
            ),

            // Index on Type for fast lookups
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Ascending(x => x.Type)
            ),

            // Index on WalletFrom for fast lookups
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Ascending(x => x.WalletFrom)
            ),

            // Index on WalletTo for fast lookups
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Ascending(x => x.WalletTo)
            ),

            // Index on PaymentId for fast lookups
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Ascending(x => x.PaymentId)
            ),

            // Compound index on UserId, ContentId
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Combine(
                    Builders<ContentPurchase>.IndexKeys.Ascending(x => x.UserId),
                    Builders<ContentPurchase>.IndexKeys.Ascending(x => x.ContentId)
                )
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<ContentPurchase>(
                Builders<ContentPurchase>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}

public class ContentPurchaseError
{
    [BsonElement("obj")]
    public string? Obj { get; init; }

    [BsonElement("message")]
    public string? Message { get; init; }
}