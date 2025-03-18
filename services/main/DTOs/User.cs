using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class TopupWalletOutput
{
    public OutputPayment? Payment { get; set; }
    public OutputWalletTransaction? WalletTransaction { get; set; }
}

public class TopupWalletInput
{
    /// <summary>
    /// Amount - Should be in pesewas
    /// </summary>
    [Required]
    public required Int64 Amount { get; set; }
}