using main.Models;

namespace main.DTOs;

public class SaveMedia
{
    public required string Title { get; set; }

    public required S3MetaData Content { get; set; }

    public string[]? Tags { get; set; }

    public required string Visibility { get; set; }

    public double Amount { get; set; } = 0.0;
}