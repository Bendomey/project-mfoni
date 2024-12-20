
using main.Models;

namespace main.DTOs;

public class OutputCreatorApplication
{
    public required string Id { get; set; }
    public required string UserId { get; set; }
    public OutputBasicUserForAdmin? User { get; set; }
    public required string Status { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectedById { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedById { get; set; }
    public string? IdType { get; set; }
    public string? IdNumber { get; set; }
    public string? IdFrontImage { get; set; }
    public string? IdBackImage { get; set; }
    public string? IntendedPricingPackage { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}