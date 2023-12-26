using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class RekognitionMetaData
{

    [BsonElement("status")]
    public string Status { get; set; } = "PENDING"; // PENDING, INDEXED, NOT_INDEXED, FAILED
    
    [BsonElement("error_details")]
    public BsonDocument? ErrorDetails { get; set; }

    [BsonElement("face_data")]
    public RekognitionMetaDataFaceData[]? FaceData { get; set; }
}

public class RekognitionMetaDataFaceData
{
    [BsonElement("image_id")]
    public string? ImageId { get; set; }
    
    [BsonElement("face_id")]
    public string? FaceId { get; set; }
}