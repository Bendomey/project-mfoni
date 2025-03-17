using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class S3MetaDataOrientation
{
    public static readonly string LANDSCAPE = "LANDSCAPE";
    public static readonly string PORTRAIT = "PORTRAIT";
    public static readonly string SQUARE = "SQUARE";
}


public class S3MetaData
{
    [BsonElement("location")]
    public required string Location { get; set; }

    [BsonElement("orientation")]
    public required string Orientation { get; set; }
    
    [BsonElement("background_color")]
    public string? BackgroundColor { get; set; }

    [BsonElement("size")]
    public required Int64 Size { get; set; }

    [BsonElement("eTag")]
    public required string ETag { get; set; }

    [BsonElement("key")]
    public required string Key { get; set; }

    [BsonElement("server_side_encryption")]
    public required string ServerSideEncryption { get; set; }

    [BsonElement("bucket")]
    public required string Bucket { get; set; }

}