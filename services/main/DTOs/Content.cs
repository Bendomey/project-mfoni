namespace main.DTOs;

public class CreateCollectionInput
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Visibility { get; set; }
}

public class UpdateCollectionInput
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Visibility { get; set; }
}

public class AddContentsToCollectionInput
{
    public required Domains.CollectionContentInput[] ContentIds { get; set; }
}

public class RemoveContentsFromCollectionInput
{
    public required string[] ContentIds { get; set; }
    public required string Type { get; set; }
}

public class EditContentBasicDetailsInput
{
    public string? Title { get; set; }
    public string? Visibility { get; set; }
    public double? Amount { get; set; }
}