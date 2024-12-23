
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
    public required string[] Interests { get; set; }
    public string? About { get; set; }
    public required Int64 Followers { get; set; }
    public required string Address { get; set; }
    public required SocialMedia[] SocialMedia { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}

public class OutputBasicCreator
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Username { get; set; }
    public required string Address { get; set; }
    public string? Photo { get; set; }
    public required SocialMedia[] SocialMedia { get; set; }
}

public class OutputCreatorEnhanced
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Username { get; set; }
    public string? Photo { get; set; }
    public required string UserId { get; set; }
    public required string[] Interests { get; set; }
    public string? About { get; set; }
    public required Int64 Followers { get; set; }
    public required string Address { get; set; }
    public required SocialMedia[] SocialMedia { get; set; }
    public required DateTime CreatedAt { get; set; }
}