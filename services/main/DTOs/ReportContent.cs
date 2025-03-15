namespace main.DTOs;

public class SubmitContentReportCaseInput
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public required string ContentType { get; set; }
    public required string ContentSlug { get; set; }
    public required string ReasonForReport { get; set; }
    public string? BreakingLocalLaws { get; set; }
    public string? AdditionalDetails { get; set; }
}

public class ResolveContentReportInput
{
    public required string Message { get; set; }
}