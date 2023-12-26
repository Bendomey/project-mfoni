using main.Models;

namespace main.DTOs;

public class SaveMedia
{
    public required S3MetaData Content { get; set; }
    
    public string[]? Tags { get; set; }
    
    public required string Visibility { get; set; }
    public double Amount { get; set; } = 0.0;
}