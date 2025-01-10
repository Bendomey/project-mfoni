
namespace main.DTOs;

public class OutputExploreSection
{
    public required string Id { get; set; }
    public required string Visibility { get; set; }
    public required string Type { get; set; }
    public required string Endpoint { get; set; }
    public required string Title { get; set; }
    public required int Sort { get; set; }
    public string? SeeMorePathname { get; set; }
    public required bool EnsureAuth { get; set; }
    public OutputAdmin? CreatedBy { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}