using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public class RekognitionMetaData
{

    public required string Status { get; set; } = "PENDING"; // PENDING, SUCCESS, FAILED

    // TODO: Cross check with api docs and see what kind of data is returned
}