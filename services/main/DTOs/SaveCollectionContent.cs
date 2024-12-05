namespace main.DTOs;

public class SaveCollectionContent
{
    public required string CollectionId { get; set; }
    public required string Type { get; set; }
    public string? ContentId { get; set; }
    public string? TagId { get; set; }
    public string? ChildCollectionId { get; set; }
}