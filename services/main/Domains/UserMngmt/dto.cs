namespace main.Domains;

public class AuthenticateResponse
{
    public required Models.User User { get; set; }
    public required string Token { get; set; }
}

public class UpdateCreatorApplicationInput
{
    public string? CreatorPackageType { get; set; }
    public string? IdType { get; set; }
    public string? IdFrontImage { get; set; }
    public string? IdBackImage { get; set; }
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
