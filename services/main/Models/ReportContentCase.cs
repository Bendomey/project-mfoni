using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

public static class ReportContentCaseStatus
{
    public static readonly string SUBMITTED = "SUBMITTED";
    public static readonly string ACKNOWLEDGED = "ACKNOWLEDGED";
    public static readonly string RESOLVED = "RESOLVED";
}

public static class ReportContentCaseType
{
    public static readonly string IMAGE = "IMAGE";
    public static readonly string COLLECTION = "COLLECTION";
    public static readonly string TAG = "TAG";
}

public static class ReportContentCaseReason
{
    public static readonly string DATA_PROTECTION_AND_PRIVACY_VIOLATION = "DATA_PROTECTION_AND_PRIVACY_VIOLATION";
    public static readonly string PORNOGRAPHY_AND_SEXUALIZED_CONTENT = "PORNOGRAPHY_AND_SEXUALIZED_CONTENT";
    public static readonly string PROTECTION_OF_MINORS = "PROTECTION_OF_MINORS";
    public static readonly string PUBLIC_SECURITY = "PUBLIC_SECURITY";
    public static readonly string SCAMS_AND_FRAUD = "SCAMS_AND_FRAUD";
    public static readonly string UNSAFE_AND_ILLEGAL = "UNSAFE_AND_ILLEGAL";
    public static readonly string VIOLENCE = "VIOLENCE";
    public static readonly string OTHER = "OTHER";
}

public static class ReportContentCaseBreakingLocalLaws
{
    public static readonly string YES = "YES";
    public static readonly string NOT_SURE = "NOT_SURE";
}

public class ReportContentCase
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("case_number")]
    public required string CaseNumber { get; init; }

    [BsonElement("content_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ContentId { get; init; }

    [BsonElement("content_type")]
    public required string ContentType { get; init; }

    [BsonElement("reason_for_report")]
    public required string ReasonForReport { get; init; }

    [BsonElement("breaking_local_laws")]
    public string? BreakingLocalLaws { get; init; } = ReportContentCaseBreakingLocalLaws.NOT_SURE;

    [BsonElement("additional_details")]
    public string? AdditionalDetails { get; init; }

    [BsonElement("status")]
    public string Status { get; init; } = ReportContentCaseStatus.SUBMITTED;

    [BsonElement("acknowledged_at")]
    public DateTime? AcknowledgedAt { get; set; }

    [BsonElement("acknowledged_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? AcknowledgedById { get; set; }

    [BsonElement("resolved_at")]
    public DateTime? ResolvedAt { get; set; }

    [BsonElement("resolved_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ResolvedById { get; set; }

    [BsonElement("message")]
    public string? ResolvedMessage { get; init; }

    // for anonumous report
    [BsonElement("name")]
    public string? Name { get; init; }

    [BsonElement("phone")]
    public string? Phone { get; init; }

    [BsonElement("email")]
    public string? Email { get; init; }

    // for logged in user
    [BsonElement("created_by_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedById { get; init; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
