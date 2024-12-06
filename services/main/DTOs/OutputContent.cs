

namespace main.DTOs;

public class OutputContent
{
    public string Id { get; set; } = null!;
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public string Type { get; set; } = "IMAGE";
    public string Status { get; set; } = null!;
    public DateTime? RejectedAt { get; set; } = null!;
    public DateTime? DoneAt { get; set; } = null!;
    public List<OutputTag>? Tags { get; set; }
    public required string Media { get; set; }
    public required string MediaOrientation { get; set; }
    public Int64 Amount { get; set; } = 0;
    public Int64 Views { get; set; } = 0;
    public Int64 Downloads { get; set; } = 0;
    public Int64 Likes { get; set; } = 0;
    public OutputContentLike? CurrentUserLike { get; set; }
    public required string CreatedById { get; set; }
    public OutputBasicCreator? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}