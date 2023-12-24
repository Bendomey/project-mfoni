using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class S3MetaData
{

    public required string URL { get; set; }

    // TODO: Cross check with api docs and see what kind of data is returned
}