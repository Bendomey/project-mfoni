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
    /// <example>BASIC | ADVANCED</example>
    [Required]
    public required string PricingPackage { get; set; }

    /// <summary>
    /// Period to subscribe for in months.
    /// </summary>
    /// <example>1</example>
    [Required]
    public required int Period { get; set; }


    /// <summary>
    /// This deteremines if an upgrade should take effect immediately or at the end of the current subscription period.
    /// Possible values are INSTANT | DEFER
    /// </summary>
    /// <example>INSTANT</example>
    public string? UpgradeEffect { get; set; }
}