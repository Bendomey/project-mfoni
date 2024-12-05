using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class ContentStatus
{
    public static readonly string PROCESSING = "PROCESSING";
    public static readonly string DONE = "DONE";
    public static readonly string REJECTED = "REJECTED";
}

public static class ContentVisibility
{
    public static readonly string PUBLIC = "PUBLIC";
    public static readonly string PRIVATE = "PRIVATE";
}

public static class ContentType
{
    public static readonly string IMAGE = "IMAGE";
    public static readonly string VIDEO = "VIDEO";
}


public class Content
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("slug")]
    public required string Slug { get; set; }

    [BsonElement("title")]
    public required string Title { get; set; }

    [BsonElement("type")]
    public string Type { get; set; } = ContentType.IMAGE;

    [BsonElement("status")]
    public string Status { get; set; } = ContentStatus.PROCESSING;

    [BsonElement("rejected_at")]
    public DateTime? RejectedAt { get; set; }

    [BsonElement("done_at")]
    public DateTime? DoneAt { get; set; }

    [BsonElement("visibility")]
    public string Visibility { get; set; } = ContentVisibility.PUBLIC;

    [BsonElement("amount")]
    public Int64 Amount { get; set; } = 0; // Pesewas equivalent. 0 for free

    [BsonElement("views")]
    public Int64 Views { get; set; } = 0;

    [BsonElement("downloads")]
    public Int64 Downloads { get; set; } = 0;

    [BsonElement("likes")]
    public Int64 Likes { get; set; } = 0;

    [BsonElement("rekognition_metadata")]
    public RekognitionMetaData? RekognitionMetaData { get; set; }

    [BsonElement("media")]
    public required S3MetaData Media { get; set; }

    [BsonElement("blurred_media")]
    public S3MetaData? BlurredMedia { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}