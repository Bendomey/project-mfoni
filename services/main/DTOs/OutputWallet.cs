
namespace main.DTOs;

public class OutputAdminWallet
{
    public required string Id { get; set; }
    public required Int64 Wallet { get; set; }
    public required Int64 BookWallet { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}