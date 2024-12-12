
namespace main.DTOs;

public class OutputContentLike
{
    public required string Id { get; set; }
    public required string ContentId { get; set; }
    public OutputContent? Content { get; set; }
    public required string UserId { get; set; }
    public OutputBasicUser? User { get; set; }
    public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}