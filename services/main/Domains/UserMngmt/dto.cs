namespace main.Domains;

public class AuthenticateResponse
{
    public required Models.User User { get; set; }
    public required string Token { get; set; }
}

public class SubmitCreatorApplicationInput
{
    public required string IdType { get; set; }
    public required string IdNumber { get; set; }
    public required string IdFrontImage { get; set; }
    public required string IdBackImage { get; set; }
}

public class ApproveCreatorApplicationInput
{
    public required string CreatorApplicationId { get; set; }
}

public class RejectCreatorApplicationInput
{
    public required string CreatorApplicationId { get; set; }
    public string? Reason { get; set; }
}
