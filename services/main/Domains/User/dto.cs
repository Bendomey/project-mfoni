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

public class GetUsersInput
{
    public string? Status { get; set; }
    public string? Role { get; set; }
    public string? Provider { get; set; }
    public string? Search { get; set; }
}


public class ActivateCreatorSubscriptionInput
{
    public required string CreatorId { get; set; }
    public required string PricingPackage { get; set; }
    public required int Period { get; set; }

    // INSTANT / DEFER
    public string? UpgradeEffect { get; set; }
}

public class SubscribeToPackageInput
{
    public required Models.Creator Creator { get; set; }
    public required Models.User User { get; set; }
    public required string PricingPackage { get; set; }
    public required int Period { get; set; }
}

public class GetUserInfoResponse
{
    public required Models.User User { get; set; }
    public required Models.Creator Creator { get; set; }
    public required Models.CreatorSubscription CreatorSubscription { get; set; }
}

public class GetCreatorsInput
{
    public string? Query { get; set; }
}
