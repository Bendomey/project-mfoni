
namespace main.DTOs;

public class OutputTagContent
{
    public required string Id { get; set; }
    public required string ContentId { get; set; }
    public OutputContent? Content { get; set; }
    public required string TagId { get; set; }
    public OutputTag? Tag { get; set; }
    public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}