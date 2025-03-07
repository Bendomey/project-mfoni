namespace main.DTOs;

public class OutputPayment
{
    public required string Id { get; set; }
    public required Int64 Amount { get; set; }
    public required string Reference { get; set; }
    public string? AccessCode { get; set; }
    public string? AuthorizationUrl { get; set; }
    public string? Channel { get; set; }
    public DateTime? SuccessfulAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? FailedAt { get; set; }
    public required string Status { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}
