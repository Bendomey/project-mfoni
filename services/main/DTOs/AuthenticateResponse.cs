namespace main.DTOs;

public class AuthenticateResponse
{
    public required OutputUser User { get; set; }
    public required string Token { get; set; }
}

public class AdminAuthenticateResponse
{
    public required OutputAdmin Admin { get; set; }
    public required string Token { get; set; }
}
