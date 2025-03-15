namespace main.DTOs;

public class OutputReportContentCase
{
    public required string Id { get; set; }
    public required string CaseNumber { get; set; }
    public required string ContentId { get; set; }
    public required string ContentType { get; set; }
    public required string ReasonForReport { get; set; }
    public string? BreakingLocalLaws { get; set; }
    public string? AdditionalDetails { get; set; }
    public required string Status { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? AcknowledgedById { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedById { get; set; }
    public string? ResolvedMessage { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? CreatedById { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}
