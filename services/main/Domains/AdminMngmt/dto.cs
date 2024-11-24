namespace main.Domains;

public class CreateAdminInput
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? CreatedBy { get; set; }
}

public class AdminAuthenticateResponse
{
    public required Models.Admin Admin { get; set; }
    public required string Token { get; set; }
}

public class UpdateAdminWalletInput
{
    public required Int64 BookWallet { get; set; }
    public required Int64 Wallet { get; set; }
}