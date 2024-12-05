
using main.Models;

namespace main.DTOs;

public class OutputUser
{
    public required string Id { get; set; }
    public required string Status { get; set; }
    public string? Role { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
    public DateTime? EmailVerifiedAt { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? PhoneNumberVerifiedAt { get; set; }
    public string? Photo { get; set; }
    public Int64 Wallet { get; set; }
    public Int64 BookWallet { get; set; }
    public OutputCreator? Creator { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}

public class OutputBasicCreator
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Username { get; set; }
    public string? Photo { get; set; }
    public required SocialMedia[] SocialMedia { get; set; }
}