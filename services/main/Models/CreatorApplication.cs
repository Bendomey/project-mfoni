using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class CreatorApplicationStatus
{
    public static readonly string PENDING = "PENDING";
    public static readonly string SUBMITTED = "SUBMITTED";
    public static readonly string REJECTED = "REJECTED";
    public static readonly string APPROVED = "APPROVED";
}

public static class IdType
{
    public static readonly string DRIVERS_LICENSE = "DRIVERS_LICENSE";
    public static readonly string NATIONAL_ID = "NATIONAL_ID";
    public static readonly string VOTERS = "VOTERS";
}

public class CreatorApplication
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; init; }

    [BsonElement("status")]
    public string Status { get; set; } = CreatorApplicationStatus.PENDING;

    [BsonElement("submitted_at")]
    public DateTime? SubmittedAt { get; set; }

    [BsonElement("rejected_at")]
    public DateTime? RejectedAt { get; set; }

    [BsonElement("rejected_reason")]
    public string? RejectedReason { get; set; }

    [BsonElement("rejected_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? RejectedById { get; set; }

    [BsonElement("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [BsonElement("approved_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ApprovedById { get; set; }

    [BsonElement("id_type")]
    public string? IdType { get; set; }

    [BsonElement("id_number")]
    public string? IdNumber { get; set; }

    [BsonElement("id_front_image")]
    public string? IdFrontImage { get; set; }

    [BsonElement("id_back_image")]
    public string? IdBackImage { get; set; }

    [BsonElement("intended_pricing_package")]
    public string? IntendedPricingPackage { get; set; } // FREE | BASIC | ADVANCED

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<CreatorApplication> collection)
    {
        var indexModels = new List<CreateIndexModel<CreatorApplication>>
        {
            // Index on UserId for fast lookups
            new CreateIndexModel<CreatorApplication>(
                Builders<CreatorApplication>.IndexKeys.Ascending(x => x.UserId)
            ),

            // Index on Status for fast lookups
            new CreateIndexModel<CreatorApplication>(
                Builders<CreatorApplication>.IndexKeys.Ascending(x => x.Status)
            ),

            // Index on IntendedPricingPackage for fast lookups
            new CreateIndexModel<CreatorApplication>(
                Builders<CreatorApplication>.IndexKeys.Ascending(x => x.IntendedPricingPackage)
            ),

            // Index on SubmittedAt for sorting
            new CreateIndexModel<CreatorApplication>(
                Builders<CreatorApplication>.IndexKeys.Descending(x => x.SubmittedAt)
            ),

            // Index on RejectedAt for sorting
            new CreateIndexModel<CreatorApplication>(
                Builders<CreatorApplication>.IndexKeys.Descending(x => x.RejectedAt)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<CreatorApplication>(
                Builders<CreatorApplication>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}
