using main.Models;

namespace main.DTOs;

public class OutputCollection
{
    public required string Id { get; set; }
    public required string Slug { get; set; }
    public required string Name { get; set; }
    public required int ContentsCount { get; set; }
    public string? Description { get; set; }
    public string CreatedByRole { get; set; } = CollectionCreatedByRole.SYSTEM;
    public string? CreatedById { get; set; }
    public OutputBasicUser? CreatedBy { get; set; }
    public List<OutputCollectionContent>? ContentItems { get; set; } = null;
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}
