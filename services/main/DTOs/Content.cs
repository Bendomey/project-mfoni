namespace main.DTOs;

public class CreateCollectionInput
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Visibility { get; set; }
}