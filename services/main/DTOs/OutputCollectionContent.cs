using main.Models;

namespace main.DTOs;

public class OutputCollectionContent
{
    public required string Id { get; set; }
    public required string Type { get; set; }
    public required string CollectionId { get; set; }
    public OutputCollection? Collection { get; set; }
    public string? ContentId { get; set; }
    public OutputContent? Content { get; set; }
    public string? TagId { get; set; }
    public OutputTag? Tag { get; set; }
    public string? ChildCollectionId { get; set; }
    public OutputCollection? ChildCollection { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}
