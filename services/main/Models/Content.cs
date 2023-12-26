using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class Content
{
    [BsonElement("_id")]
    public ObjectId Id { get; set; }
    
    [BsonElement("type")]
    public string Type { get; set; } = "IMAGE"; // IMAGE | VIDEO

    [BsonElement("status")]
    public string Status { get; set; } = "PROCESSING"; // PROCESSING | DONE
    
    [BsonElement("rejected_at")]
    public DateTime? RejectedAt { get; set; }
    
    [BsonElement("done_at")]
    public DateTime? DoneAt { get; set; }

    [BsonElement("visibility")]
    public string Visibility { get; set; } = "PUBLIC"; // PUBLIC | PRIVATE

    [BsonElement("amount")]
    public int Amount { get; set; } = 0; // Pesewas equivalent. 0 for free

    [BsonElement("rekognition_metadata")]
    public RekognitionMetaData? RekognitionMetaData { get; set; }

    [BsonElement("media")]
    public required S3MetaData Media { get; set; }

    [BsonElement("blurred_media")]
    public S3MetaData? BlurredMedia { get; set; }

    [BsonElement("tag_ids")]
    public List<ObjectId>? Tags { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    public ObjectId? CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; }  = DateTime.UtcNow;
}