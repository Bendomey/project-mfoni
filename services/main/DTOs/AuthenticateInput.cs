using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class AuthenticateInput
{
    /// <summary>
    /// Can be `GOOGLE` or `TWITTER` or `FACEBOOK`
    /// </summary>
    [Required]
    public required string Provider { get; set; } // 'GOOGLE' | 'TWITTER' | 'FACEBOOK'

    [Required]
    public required string Uid { get; set; }

    [Required]
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? UserPhoto { get; set; }
}
