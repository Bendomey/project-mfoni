using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class RejectCreatorApplicationInput
{
    public string? Reason { get; set; }
}

public class ActivateCreatorSubscriptionInput
{
    /// <summary>
    /// Package Type
    /// </summary>
    /// <example>BASIC | ADVANCE</example>
    [Required]
    public required string PricingPackage { get; set; }

    /// <summary>
    /// Period to subscribe for in months.
    /// </summary>
    /// <example>1</example>
    [Required]
    public required int Period { get; set; }
}