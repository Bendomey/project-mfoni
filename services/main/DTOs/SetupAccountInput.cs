using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class SetupAccountInput
{
    /// <summary>
    /// Can be `CLIENT` or `CREATOR`
    /// </summary>
    [Required]
    public required string Role { get; set; } // 'CLIENT' | 'CREATOR'

    /// <summary>
    /// The user's name
    /// </summary>
    [Required]
    public required string Name { get; set; }

    /// <summary>
    /// Can be `MfoniPackage.Free` or `MfoniPackage.Basic` or `MfoniPackage.Advanced`
    /// </summary>
    public string? IntendedPricingPackage { get; set; } // MfoniPackage.Free | MfoniPackage.Basic | MfoniPackage.Advanced
}
