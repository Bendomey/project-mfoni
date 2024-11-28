
using main.Models;

namespace main.DTOs;

public class OutputCreatorSubscription
{
    public required string Id { get; set; }
    public required string PackageType { get; set; }
    public required DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public double? Period { get; set; }
    public List<OutputCreatorSubscriptionPurchase>? CreatorSubscriptionPurchases { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}