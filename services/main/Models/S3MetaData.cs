using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class S3MetaData
{
    public required string Location { get; set; }

    public required string ETag { get; set; }

    public required string Key { get; set; }

    public required string ServerSideEncryption { get; set; }

    public required string Bucket { get; set; }

}