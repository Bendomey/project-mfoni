using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class OneTimePaymentStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
}

// Base Payment model for one time payments.
public class OneTimePayment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("reference")]
    public required string Reference { get; set; }

    [BsonElement("access_code")]
    public required string AccessCode { get; set; }

    [BsonElement("authorization_url")]
    public required string AuthorizationUrl { get; set; }

    [BsonElement("amount")]
    public required double Amount { get; set; }

    [BsonElement("status")]
    public required string Status { get; set; }

    [BsonElement("successful_at")]
    public DateTime SuccessfulAt { get; init; }

    [BsonElement("failed_at")]
    public DateTime FailedAt { get; init; }

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
    public required string Origin { get; set; } // ContentPurchase | Commission
}