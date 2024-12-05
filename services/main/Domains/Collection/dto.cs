namespace main.Domains;

public class SaveCollection
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Description { get; set; }
    public string? CreatedById { get; set; }
    public string? CreatedByRole { get; set; }
    public string? Visibility { get; set; }
}

public class GetCollectionContentsInput
{
    public string? CollectionId { get; set; }
    public string? ContentId { get; set; }
    public string? TagId { get; set; }
    public string? ChildCollectionId { get; set; }
}