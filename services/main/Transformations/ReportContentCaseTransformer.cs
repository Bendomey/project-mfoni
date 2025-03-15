using main.DTOs;
using main.Models;


namespace main.Transformations;

public class ReportContentCaseTransformer
{
    public async Task<OutputReportContentCase> Transform(ReportContentCase reportContentCase, string[]? populate = null)
    {
        populate ??= Array.Empty<string>();

        return new OutputReportContentCase
        {
            Id = reportContentCase.Id,
            CaseNumber = reportContentCase.CaseNumber,
            ContentId = reportContentCase.ContentId,
            ContentType = reportContentCase.ContentType,
            ReasonForReport = reportContentCase.ReasonForReport,
            BreakingLocalLaws = reportContentCase.BreakingLocalLaws,
            AdditionalDetails = reportContentCase.AdditionalDetails,
            Status = reportContentCase.Status,
            AcknowledgedAt = reportContentCase.AcknowledgedAt,
            AcknowledgedById = reportContentCase.AcknowledgedById,
            ResolvedAt = reportContentCase.ResolvedAt,
            ResolvedById = reportContentCase.ResolvedById,
            ResolvedMessage = reportContentCase.ResolvedMessage,
            Name = reportContentCase.Name,
            Phone = reportContentCase.Phone,
            Email = reportContentCase.Email,
            CreatedById = reportContentCase.CreatedById,
            CreatedAt = reportContentCase.CreatedAt,
            UpdatedAt = reportContentCase.UpdatedAt,
        };
    }
}