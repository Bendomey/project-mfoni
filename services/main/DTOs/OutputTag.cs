
namespace main.DTOs;

public class OutputTag
{
    public required string Id { get; set; }
    public required string Slug { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? CreatedByAdminId { get; set; }
    public OutputAdmin? CreatedByAdmin { get; set; }
    public string? CreatedByUserId { get; set; }
    public OutputBasicUser? CreatedByUser { get; set; }
    public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}