using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace main.DTOs;

public class CreateAdminInput
{
    public required string Name { get; set; }
    public required string Email { get; set; }
}

public class LoginAdminInput
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class UpdatePasswordInput
{
    /// <summary>
    /// Old password
    /// </summary>
    /// <example>SomeOldPassword</example>
    [Required]
    public required string OldPassword { get; set; }

    /// <summary>
    /// New Password
    /// </summary>
    [Required]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,16}$"
    )]
    public required string NewPassword { get; set; }
}
