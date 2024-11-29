using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class WalletTransactionType
{
    public static readonly string DEPOSIT = "DEPOSIT";
    public static readonly string WITHDRAW = "WITHDRAW";
}

public static class WalletTransactionReasonForTransfer
{
    public static readonly string SUBSCRIPTION = "SUBSCRIPTION";
    public static readonly string SUBSCRIPTION_REFUND = "SUBSCRIPTION FEFUND";
    public static readonly string CONTENT_PURCHASE = "CONTENT_PURCHASE";
    public static readonly string TOPUP = "TOPUP";
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

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}