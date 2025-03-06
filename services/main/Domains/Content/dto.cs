namespace main.Domains;


public class GetContentsInput
{
    public string Orientation { get; set; } = "ALL";
    public string License { get; set; } = "ALL";
    public bool IsFeatured { get; set; } = false;
}

public class ContentLikeInput
{
    public required string ContentId { get; set; }
    public required string UserId { get; set; }
}

public class EditContentBasicDetailsInput
{
    public required string ContentId { get; set; }
    public required string UserId { get; set; }
    public string? Title { get; set; }
    public string? Visibility { get; set; }
    public double? Amount { get; set; }
}

public class GetContentLikesInput
{
    public required string UserId { get; set; }
    public string? Visibility { get; set; }
    public string? Orientation { get; set; }
}

public class DownloadContentInput
{
    public required string ContentId { get; set; }
    public required string Size { get; set; }
    public string? UserId { get; set; }
}

public class PurchaseContentInput
{
    public required string PaymentMethod { get; set; } // WALLET, SAVED_CARD, ONE_TIME
    public required string ContentId { get; set; }
    public required string UserId { get; set; }
}

public class PayWithWalletInput
{
    public required Int64 Amount { get; set; }
    public required Models.User User { get; set; }
    public required string CreatorId { get; set; }
    public required string ContentId { get; set; }
    public Models.ContentPurchase? ContentPurchase { get; set; }
}