using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class RekognitionMetaDataStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string INDEXED = "INDEXED";
    public static readonly string NOT_INDEXED = "NOT_INDEXED";
    public static readonly string FAILED = "FAILED";
}

public class RekognitionMetaData
{

    [BsonElement("status")]
    public string Status { get; set; } = RekognitionMetaDataStatus.PENDING; // PENDING, INDEXED, NOT_INDEXED, FAILED

    [BsonElement("error_details")]
    public RekognitionMetaDataErrorDetails? ErrorDetails { get; set; }

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

public class RekognitionMetaDataErrorDetails
{
    [BsonElement("message")]
    public string? Message { get; set; }
}