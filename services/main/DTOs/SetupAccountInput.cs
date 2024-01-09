namespace main.DTOs;

public class SetupAccountInput
{
    public required string Role { get; set; } // 'CLIENT' | 'CREATOR'
    public required string Name { get; set; }
    public string? Username { get; set; }
}
