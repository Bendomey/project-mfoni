namespace main.Domains;

public class GetContentsForTagInput
{
    public required string TagId { get; set; }
    public required string License { get; set; }
    public required string Orientation { get; set; }
}