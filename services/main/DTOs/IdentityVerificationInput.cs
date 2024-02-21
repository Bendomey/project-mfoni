using System.Text.Json.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace main.DTOs;

public static class IdentityVerificationInputStatus
{
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
}

public class IdentityVerificationInput
{
    [JsonPropertyName("transactionnumber")]
    [BsonElement("transaction_number")]
    public required string TransactionNumber { get; set; }

    [JsonPropertyName("pictureMatchScore")]
    [BsonElement("picture_match_score")]
    public required string PictureMatchScore { get; set; }

    [JsonPropertyName("livenessverificationscore")]
    [BsonElement("liveness_verification_score")]
    public required string LivenessVerificationScore { get; set; }

    [JsonPropertyName("dateOfBirthMatchScore")]
    [BsonElement("date_of_birth_match_score")]
    public string? DateOfBirthMatchScore { get; set; }

    [JsonPropertyName("nameMatchScore")]
    [BsonElement("name_match_score")]
    public string? NameMatchScore { get; set; }

    [JsonPropertyName("originalImageURI")]
    [BsonElement("image")]
    public required string Image { get; set; }

    [JsonPropertyName("overAllComparismScore")]
    [BsonElement("overall_comparism_score")]
    public string? OverAllComparismScore { get; set; }

    [JsonPropertyName("status")]
    [BsonElement("status")]
    public required string Status { get; set; } // SUCCESSFUL / FAILED

    [JsonPropertyName("referenceid")]
    [BsonElement("reference_id")]
    public required string ReferenceId { get; set; }

    [JsonPropertyName("idNumber")]
    [BsonElement("id_number")]
    public required string IdNumber { get; set; }

    [JsonPropertyName("verification_result")]
    [BsonElement("verification_result")]
    public VerificationResult? VerificationResult { get; set; }
}

public class VerificationResult
{
    [JsonPropertyName("success")]
    [BsonElement("success")]
    public required bool Success { get; set; }
    
    [JsonPropertyName("code")]
    [BsonElement("code")]
    public required string Code { get; set; }

    [JsonPropertyName("subcode")]
    [BsonElement("subcode")]
    public string? SubCode { get; set; }

    [JsonPropertyName("msg")]
    [BsonElement("msg")]
    public required string Msg { get; set; }

    [JsonPropertyName("error")]
    [BsonElement("error")]
    public string? Error { get; set; }

    [JsonPropertyName("nationalId")]
    [BsonElement("national_id")]
    public required string NationalId { get; set; }
}