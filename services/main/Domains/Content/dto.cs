namespace main.Domains;


public class GetContentsInput
{
    public string Orientation { get; set; } = "ALL";
    public string License { get; set; } = "ALL";
}

public class ContentLikeInput
{
    public required string ContentId { get; set; }
    public required string UserId { get; set; }
}