using System.ComponentModel.DataAnnotations;

namespace main.DTOs;


public class CreateCreatorApplicationInput
{
    /// <summary>
    /// Package Type
    /// </summary>
    /// <example>FREE</example>
    [Required]
    public required string CreatorPackageType { get; set; }

    /// <summary>
    /// Id Type
    /// </summary>
    /// <example>NATIONAL_ID</example>
    [Required]
    public required string IdType { get; set; }

    /// <summary>
    /// Front Image of the Id
    /// </summary>
    /// <example>https://image.com</example>
    [Required]
    public required string IdFrontImage { get; set; }

    /// <summary>
    /// Back Image of the Id
    /// </summary>
    /// <example>https://image.com</example>
    [Required]
    public required string IdBackImage { get; set; }
}
