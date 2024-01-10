namespace main.DTOs;

public class AuthenticateInput
{
    public required string Provider { get; set; } // 'GOOGLE' | 'TWITTER' | 'FACEBOOK'
    public required string Uid { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? UserPhoto { get; set; }
}
