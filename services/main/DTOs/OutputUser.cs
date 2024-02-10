
using main.Models;

namespace main.DTOs;

public class OutputUser
{
    public required string Id { get; set; }
    public required string Role { get; set; }
    public required string Name { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Photo { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}