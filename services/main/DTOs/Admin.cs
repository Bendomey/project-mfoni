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
