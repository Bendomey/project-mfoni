using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class CreatorApplication
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("status")]
    public required string Status { get; set; } = "PENDING"; // PENDING | REJECTED | APPROVED
    
    [BsonElement("rejected_at")]
    public DateTime? RejectedAt { get; set; }

    [BsonElement("rejected_by_id")] // an admin
    public ObjectId? RejectedById { get; set; }
    
    [BsonElement("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [BsonElement("approved_by_id")] // an admin
    public ObjectId? ApprovedById { get; set; }

    [BsonElement("platform_aggrement_form")]
    public required S3MetaData PlatformAggrementForm { get; set; }

    [BsonElement("ghana_card_front")]
    public required S3MetaData GhanaCardFront { get; set; }

    [BsonElement("ghana_card_back")]
    public required S3MetaData GhanaCardBack { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    public required ObjectId CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; }  = DateTime.UtcNow;
}