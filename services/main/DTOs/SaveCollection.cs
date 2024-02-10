using main.Models;

namespace main.DTOs;

public class SaveCollection
{
    public required string Name { get; set; }
    
    public string? Description { get; set; }

    public required string Type { get; set; }
    
    public required string Visibility { get; set; }
}