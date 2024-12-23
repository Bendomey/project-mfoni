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

public class UpdateCollection
{
    public required string Id { get; set; }
    public string? UserId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Visibility { get; set; }
}

public class GetCollectionsInput
{
    public required string Visibility { get; set; }
    public string? CreatedById { get; set; }
    public string? Query { get; set; }
}


public class CollectionContentInput
{
    public required string Type { get; set; }
    public required string Id { get; set; }
}

public class AddContentsToCollectionInput
{
    public required string Id { get; set; }
    public string? UserId { get; set; }
    public required CollectionContentInput[] ContentIds { get; set; }
}

public class RemoveContentsFromCollectionInput
{
    public required string Id { get; set; }
    public string? UserId { get; set; }
    public required string[] ContentIds { get; set; }
}

public class GetCollectionContentsInput
{
    public string? CollectionId { get; set; }
    public string? ContentId { get; set; }
    public string? TagId { get; set; }
    public string? ChildCollectionId { get; set; }
    public string? Visibility { get; set; }
    public string? Orientation { get; set; }
}