using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class RekognitionMetaData
{

    public required string Status { get; set; } = "PENDING"; // PENDING, INDEXED, NOT_INDEXED, FAILED
    
    [BsonElement("error_details")]
    public BsonDocument? ErrorDetails { get; set; }

    [BsonElement("image_id")]
    public string? ImageId { get; set; }
    
    [BsonElement("face_id")]
    public string? FaceId { get; set; }
}