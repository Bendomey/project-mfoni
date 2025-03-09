using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class CreateCollectionInput
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string Visibility { get; set; }
}

public class UpdateCollectionInput
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Visibility { get; set; }
}

public class AddContentsToCollectionInput
{
    public required Domains.CollectionContentInput[] ContentIds { get; set; }
}

public class RemoveContentsFromCollectionInput
{
    public required string[] ContentIds { get; set; }
    public required string Type { get; set; }
}

public class EditContentBasicDetailsInput
{
    public string? Title { get; set; }
    public string? Visibility { get; set; }
    public double? Amount { get; set; }
}

public class DownloadContentInput
{
    /// <summary>
    /// Size
    /// </summary>
    /// <example>ORIGINAL | SMALL | MEDIUM | LARGE</example>
    [Required]
    public required string Size { get; set; }
}


public class PurchaseContentInput
{
    /// <summary>
    /// Payment Method
    /// </summary>
    /// <example>WALLET | SAVED_CARD | ONE_TIME</example>
    [Required]
    public required string PaymentMethod { get; set; }
}

public class PurchaseContentOutput
{
    /// <summary>
    /// Payment
    /// </summary>
    [Required]
    public OutputPayment? Payment { get; set; }

    /// <summary>
    /// Content Purchase
    /// </summary>
    [Required]
    public OutputContentPurchase? ContentPurchase { get; set; }
}