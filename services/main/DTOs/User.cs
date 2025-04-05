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


public class UpdateCreatorBasicDetails
{
    public Models.SocialMedia[] SocialMedia { get; set; } = [];
    public string[] Interests { get; set; } = [];
    public string? About { get; set; }
    public string? Address { get; set; }
}

public class UploadLimitForUserForCurrentMonth
{
    public Int64 Uploads { get; set; }

    /// <summary>
    /// Limit - It's only null when there's no limit.
    /// </summary>
    public Int64? Limit { get; set; }
}

public class WithdrawalLimitForUserForCurrentMonth
{
    public Int64 Withdrawal { get; set; }

    /// <summary>
    /// Limit - It's only null when there's no limit.
    /// </summary>
    public Int64? Limit { get; set; }
}