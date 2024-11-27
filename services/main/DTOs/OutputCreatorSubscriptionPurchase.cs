
using main.Models;

namespace main.DTOs;

public class OutputCreatorSubscriptionPurchase
{
    public required string Id { get; set; }
    public required string CreatorSubscriptionId { get; set; }
    public required string Type { get; set; }
    public string? SavedCardId { get; set; }
    public string? WalletId { get; set; }
    public Int64 Amount { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}