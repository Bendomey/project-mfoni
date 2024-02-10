using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class CreatorApplicationStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string REJECTED = "REJECTED";
    public static readonly string APPROVED = "APPROVED";
}

public class CreatorApplication
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("status")]
    public string Status { get; set; } = CreatorApplicationStatus.PENDING;

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
    public required string CreatedById { get; set; }

    [BsonIgnore]
    public User? CreatedBy { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}