using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class PaymentStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
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
    public required string AccessCode { get; init; }

    [BsonElement("channel")]
    public string? Channel { get; init; }

    [BsonElement("authorization_url")]
    public required string AuthorizationUrl { get; init; }

    [BsonElement("amount")]
    public required Int64 Amount { get; init; }

    [BsonElement("status")]
    public string Status { get; init; } = PaymentStatus.PENDING;

    [BsonElement("successful_at")]
    public DateTime SuccessfulAt { get; set; }

    [BsonElement("failed_at")]
    public DateTime FailedAt { get; set; }

    // TODO: fix this
    // [BsonElement("error_obj")]
    // public an ErrorObj { get; init; }

    [BsonElement("metadata")]
    public required PaymentMetaData MetaData { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


public class PaymentMetaData
{
    [BsonElement("origin")]
    public required string Origin { get; init; } // ContentPurchase | WalletTopup

    [BsonElement("content_purchase_id")]
    public string? ContentPurchaseId { get; init; }

    [BsonElement("wallet_id")]
    public string? WalletId { get; init; }
}