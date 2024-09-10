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
    public required string OldPassword { get; set; }

    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,}$"
    )]
    public required string NewPassword { get; set; }
}
