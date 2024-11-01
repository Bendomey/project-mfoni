using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class CreateAdminInput
{
    /// <summary>
    /// Name of the admin
    /// </summary>
    /// <example>John Doe</example>
    [Required]
    public required string Name { get; set; }

    /// <summary>
    /// Some email used for sign up
    /// </summary>
    /// <example>email@example.com</example>
    [Required]
    public required string Email { get; set; }
}

public class LoginAdminInput
{
    /// <summary>
    /// Some email used for sign up
    /// </summary>
    /// <example>email@example.com</example>
    [Required]
    public required string Email { get; set; }

    /// <summary>
    /// Password retrieved from email
    /// </summary>
    /// <example>SomePassword</example>
    [Required]
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
