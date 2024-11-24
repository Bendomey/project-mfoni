
using main.Models;

namespace main.DTOs;

public class OutputCreator
{
    public required string Id { get; set; }
    public required string CreatorApplicationId { get; set; }
    public required string Status { get; set; }
    public OutputCreatorSubscription? Subscription { get; set; }
    public required string UserId { get; set; }
    public required string Username { get; set; }
    public required SocialMedia[] SocialMedia { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}