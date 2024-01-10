using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class CreatorApplication
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("status")]
    public string Status { get; set; } = "PENDING"; // PENDING | SUBMITTED | REJECTED | APPROVED

    [BsonElement("rejected_at")]
    public DateTime? RejectedAt { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("rejected_by_id")] // an admin
    public string? RejectedBy { get; set; }

    [BsonElement("submitted_at")]
    public DateTime? SubmittedAt { get; set; }

    [BsonElement("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("approved_by_id")] // an admin
    public string? ApprovedBy { get; set; }

    [BsonElement("platform_aggrement_form")]
    public S3MetaData? PlatformAggrementForm { get; set; }

    [BsonElement("ghana_card_front")]
    public S3MetaData? GhanaCardFront { get; set; }

    [BsonElement("ghana_card_back")]
    public S3MetaData? GhanaCardBack { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("created_by_id")]
    public required string CreatedBy { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}