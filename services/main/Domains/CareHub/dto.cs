namespace main.Domains;

public class SubmitContentReportInput
{
    public string? UserId { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public required string ContentType { get; set; }
    public required string ContentSlug { get; set; }
    public required string ReasonForReport { get; set; }
    public string? BreakingLocalLaws { get; set; }
    public string? AdditionalDetails { get; set; }
}

public class AcknowledgeContentReportInput
{
    public required string AdminId { get; set; }
    public required string ReportContentCaseId { get; set; }
}

public class ResolveContentReportInput
{
    public required string AdminId { get; set; }
    public required string ReportContentCaseId { get; set; }
    public required string Message { get; set; }
}