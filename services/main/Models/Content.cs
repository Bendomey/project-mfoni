using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

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
    public string Visibility { get; set; } = ContentVisibility.PRIVATE;

    // This is the visibility the user intended. Actual visibility will always be PRIVATE until the content is processed.
    [BsonElement("intented_visibility")]
    public string? IntendedVisibility { get; set; } = ContentVisibility.PRIVATE;

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

    [BsonElement("is_searchable")]
    public bool IsSearchable { get; set; } = true;

    [BsonElement("media")]
    public required S3MetaData Media { get; set; }

    [BsonElement("blurred_media")]
    public S3MetaData? BlurredMedia { get; set; }

    [BsonElement("small_media")]
    public S3MetaData? SmallMedia { get; set; }

    [BsonElement("medium_media")]
    public S3MetaData? MediumMedia { get; set; }

    [BsonElement("large_media")]
    public S3MetaData? LargeMedia { get; set; }

    [BsonElement("is_featured")]
    public bool IsFeatured { get; set; } = false;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CreatedById { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<Content> collection)
    {
        var indexModels = new List<CreateIndexModel<Content>>
        {
            // Unique index on Slug
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Ascending(x => x.Slug),
                new CreateIndexOptions { Unique = true }
            ),

            // Index on CreatedById for fast lookups
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Ascending(x => x.CreatedById)
            ),

            // Index on Type for fast lookups
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Ascending(x => x.Type)
            ),

            // Index on Status for fast lookups
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Ascending(x => x.Status)
            ),

            // Index on Visibility for fast lookups
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Ascending(x => x.Visibility)
            ),

            // Index on IsFeatured for filtering
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Ascending(x => x.IsFeatured)
            ),

            // Index on IsSearchable for filtering
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Ascending(x => x.IsSearchable)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<Content>(
                Builders<Content>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}