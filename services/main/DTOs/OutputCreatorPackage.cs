
using main.Models;

namespace main.DTOs;

public class OutputCreatorPackage
{
    public required string Id { get; set; }
    public required string PackageType { get; set; }
    public required string Status { get; set; }
    public DateTime? DeactivatedAt { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}