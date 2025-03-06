using main.Models;

namespace main.DTOs;

public class OutputContentPurchase
{
    public required string Id { get; set; }
    public required Int64 Amount { get; set; }
    public required string Type { get; set; }
    public required string Status { get; set; }
    public required string ContentId { get; set; }
    public OutputContent? Content { get; set; }
    public string? PaymentId { get; set; }
    public OutputPayment? Payment { get; set; }
    public string? WalletFromId { get; set; }
    public OutputWalletTransaction? WalletFrom { get; set; }
    public string? WalletToId { get; set; }
    public OutputWalletTransaction? WalletTo { get; set; }
    // public string? SavedCardId { get; set; }
    // public OutputSavedCard? SavedCard { get; set; }
    public string? CreatedById { get; set; }
    public OutputBasicUser? CreatedBy { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}
