using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class CreatorApplication
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("status")]
    public string Status { get; set; } = "PENDING"; // PENDING | REJECTED | APPROVED

    [BsonElement("rejected_at")]
    public DateTime? RejectedAt { get; set; }

    [BsonElement("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [BsonElement("smile_identity_response")]
    public string? SmileIdentityResponse { get; set; } // Gunna verify the json structure when implementing!

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonRepresentation(BsonType.ObjectId)]
    [BsonElement("created_by_id")]
    public required string CreatedBy { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}