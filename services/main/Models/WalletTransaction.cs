using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class WalletTransactionType
{
    public static readonly string DEPOSIT = "DEPOSIT";
    public static readonly string WITHDRAW = "WITHDRAW";
}

public static class WalletTransactionReasonForTransfer
{
    public static readonly string SUBSCRIPTION = "SUBSCRIPTION";
    public static readonly string SUBSCRIPTION_REFUND = "SUBSCRIPTION_REFUND";
    public static readonly string CONTENT_PURCHASE = "CONTENT_PURCHASE";
    public static readonly string TOPUP = "TOPUP";
    public static readonly string TRANSFER_TO_BANK_OR_MOMO = "TRANSFER_TO_BANK_OR_MOMO";
    public static readonly string TRANSFER_BETWEEN_USERS = "TRANSFER_BETWEEN_USERS";
}

public static class WalletTransactionStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
    public static readonly string CANCELLED = "CANCELLED";
}

// Our own form of e wallet. Keeps track of all transations made by a user with their wallet.
public class WalletTransaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; init; }

    [BsonElement("type")]
    public required string Type { get; init; }

    [BsonElement("amount")]
    public required Int64 Amount { get; init; }

    [BsonElement("reason_for_transfer")]
    public required string ReasonForTransfer { get; init; }

    // pass this when you topup with your momo/card.
    [BsonElement("payment_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? PaymentId { get; set; }

    // pass this when you withdraw with your momo/card successfully
    [BsonElement("transfer_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TransferId { get; set; }

    [BsonElement("status")]
    public string Status { get; init; } = WalletTransactionStatus.PENDING;

    [BsonElement("successful_at")]
    public DateTime? SuccessfulAt { get; init; }

    [BsonElement("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    [BsonElement("failed_at")]
    public DateTime? FailedAt { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<WalletTransaction> collection)
    {
        var indexModels = new List<CreateIndexModel<WalletTransaction>>
        {
            // Index on UserId for fast lookups
            new CreateIndexModel<WalletTransaction>(
                Builders<WalletTransaction>.IndexKeys.Ascending(x => x.UserId)
            ),

            // Index on Type for fast lookups
            new CreateIndexModel<WalletTransaction>(
                Builders<WalletTransaction>.IndexKeys.Ascending(x => x.Type)
            ),

            // Index on ReasonForTransfer for fast lookups
            new CreateIndexModel<WalletTransaction>(
                Builders<WalletTransaction>.IndexKeys.Ascending(x => x.ReasonForTransfer)
            ),

            // Index on PaymentId for fast lookups
            new CreateIndexModel<WalletTransaction>(
                Builders<WalletTransaction>.IndexKeys.Ascending(x => x.PaymentId)
            ),

            // Index on TransferId for fast lookups
            new CreateIndexModel<WalletTransaction>(
                Builders<WalletTransaction>.IndexKeys.Ascending(x => x.TransferId)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<WalletTransaction>(
                Builders<WalletTransaction>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}
