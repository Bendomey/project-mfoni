
namespace main.DTOs;

public class OutputWalletTransaction
{
    public required string Id { get; set; }
    public required string Type { get; set; }
    public required Int64 Amount { get; set; }
    public required string ReasonForTransfer { get; set; }

    // TODO: work on payment population
    // public string? PaymentId { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}