

namespace main.DTOs;

public class OutputContent
{
    public string Id { get; set; } = null!;
    public string Type { get; set; } = "IMAGE";
    public string Status { get; set; } = null!;
    public DateTime? RejectedAt { get; set; } = null!;
    public string Visibility { get; set; } = null!;
    public DateTime? DoneAt { get; set; } = null!;
    public List<OutputTag>? Tags { get; set; }
    public string Media { get; set; } = null!;
    public Int64 Amount { get; set; } = 0;
    public required string CreatedById { get; set; }
    public OutputUser? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}