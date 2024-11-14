using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class CommissionType
{
    public static readonly string DEPOSIT = "DEPOSIT";
    public static readonly string WITHDRAW = "WITHDRAW";
}

// Our own form of e wallet. Keeps track of all transations made by a user with their wallet.
public class Commission
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; init; }

    [BsonElement("type")]
    public required double Type { get; set; }

    [BsonElement("commission")]
    public required double Amount { get; set; }

    [BsonElement("reason_for_transfer")]
    public required string ReasonForTransfer { get; set; }

    // TODO: add content purchase related models later.
    // Pass this if someone bought their content or you’re buying someone’s content
    [BsonElement("content_purchase_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ContentPurchaseId { get; set; }

    // pass this when you use commission to pay for your subscription fees.
    [BsonElement("creator_subscription_purchase_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatorSubscriptionPurchaseId { get; set; }

    // pass this when you topup with your momo/card.
    [BsonElement("payment_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? PaymentId { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
