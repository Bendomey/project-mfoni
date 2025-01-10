namespace main.Domains;

public class CreateExploreSection
{
    public required string Type { get; set; }
    public required string Endpoint { get; set; }
    public required string Title { get; set; }
    public string? SeeMorePathname { get; set; }
    public bool? EnsureAuth { get; set; }
    public string? Visibility { get; set; }
    public string? CreatedById { get; set; }
}