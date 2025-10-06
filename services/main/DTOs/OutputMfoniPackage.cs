
namespace main.DTOs;

public class OutputMfoniPackage
{
    public required string Id { get; set; }
    public required string Code { get; set; }
    public required string Alias { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required Int64 Amount { get; set; }
    public required string Currency { get; set; }
    public required string Status { get; set; }
    public required List<OutputMfoniPackageFeature> Features { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}

public class OutputMfoniPackageFeature
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }

    public required string Type { get; set; }
    public required string Value { get; set; }
}