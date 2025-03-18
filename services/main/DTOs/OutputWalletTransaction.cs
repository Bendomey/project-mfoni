
namespace main.DTOs;

public class OutputWalletTransaction
{
    public required string Id { get; set; }
    public required string Type { get; set; }
    public required Int64 Amount { get; set; }
    public required string ReasonForTransfer { get; set; }
    public required string Status { get; set; }
    public DateTime? SuccessfulAt { get; set; }
    public DateTime? FailedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // TODO: work on payment population
    // public string? PaymentId { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}