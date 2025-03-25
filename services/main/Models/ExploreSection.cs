using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Models;

public static class ExploreSectionType
{
    public static readonly string TAG = "TAG";
    public static readonly string COLLECTION = "COLLECTION";
    public static readonly string CREATOR = "CREATOR";
    public static readonly string CONTENT = "CONTENT";
}

public static class ExploreSectionVisibility
{
    public static readonly string PUBLIC = "PUBLIC";
    public static readonly string PRIVATE = "PRIVATE";
}

public class ExploreSection
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("visibility")]
    public string Visibility { get; set; } = ExploreSectionVisibility.PRIVATE;

    [BsonElement("type")]
    public required string Type { get; set; }

    [BsonElement("endpoint")]
    public required string Endpoint { get; set; }

    [BsonElement("title")]
    public required string Title { get; set; }

    [BsonElement("sort")]
    public required int Sort { get; set; }

    [BsonElement("see_more_pathname")]
    public string? SeeMorePathname { get; set; }

    [BsonElement("ensure_auth")]
    public bool EnsureAuth { get; set; } = false;

    [BsonElement("created_by_id")]
    public string? CreatedById { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public static async Task EnsureIndexesAsync(IMongoCollection<ExploreSection> collection)
    {
        var indexModels = new List<CreateIndexModel<ExploreSection>>
        {
            // Index on Visibility for fast lookups
            new CreateIndexModel<ExploreSection>(
                Builders<ExploreSection>.IndexKeys.Ascending(x => x.Visibility)
            ),

            // Index on Title for fast lookups
            new CreateIndexModel<ExploreSection>(
                Builders<ExploreSection>.IndexKeys.Ascending(x => x.Title)
            ),

            // Index on Type for fast lookups
            new CreateIndexModel<ExploreSection>(
                Builders<ExploreSection>.IndexKeys.Ascending(x => x.Type)
            ),

            // Index on CreatedById for fast lookups
            new CreateIndexModel<ExploreSection>(
                Builders<ExploreSection>.IndexKeys.Ascending(x => x.CreatedById)
            ),

            // Index on Sort for sorting
            new CreateIndexModel<ExploreSection>(
                Builders<ExploreSection>.IndexKeys.Ascending(x => x.Sort)
            ),

            // Index on CreatedAt for sorting
            new CreateIndexModel<ExploreSection>(
                Builders<ExploreSection>.IndexKeys.Descending(x => x.CreatedAt)
            )
        };

        await collection.Indexes.CreateManyAsync(indexModels);
    }
}
