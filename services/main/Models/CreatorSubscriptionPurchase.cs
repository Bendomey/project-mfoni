using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class CreatorSubscriptionPurchaseType
{
    public static readonly string CARD = "CARD";
    public static readonly string WALLET = "WALLET";
}

// On successful subscription purchase, save the deets of the purchase.
public class CreatorSubscriptionPurchase
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("creator_subscription_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatorSubscriptionId { get; init; }

    [BsonElement("type")]
    public required string Type { get; init; }

    // if payment was done with user's card, log it here.
    [BsonElement("saved_card_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? SavedCardId { get; set; }

    // if payment was done with user's wallet, log it here.
    [BsonElement("wallet_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WalletId { get; set; }

    [BsonElement("amount")]
    public required double Amount { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
