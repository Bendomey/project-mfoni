using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.DTOs;
public class WaitlistEntry
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id {get; init;} = null!;
    
    [BsonElement("email")]
    public required string Email { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt {get;} = DateTime.UtcNow;
}