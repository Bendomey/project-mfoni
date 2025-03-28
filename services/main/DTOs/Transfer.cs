using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class CreateTransferRecipientInput
{
    /// <summary>
    /// Type - mobile_money, ghipps
    /// </summary>
    [Required]
    public required string Type { get; set; }

    [Required]
    public required string RecipientCode { get; set; }

    [Required]
    public required string AccountNumber { get; set; }

    [Required]
    public required string AccountName { get; set; }

    [Required]
    public required string BankName { get; set; }

    [Required]
    public required string BankCode { get; set; }
}


public class DeleteTransferRecipientInput
{

    [Required]
    public required string TransferRecipientId { get; set; }
}


public class InitiateTransferInput
{
    public required Int64 Amount { get; set; }
    public string? Reason { get; set; }
    public required string TransferRecipientId { get; set; }
    // when there's a reference then it means the transfer is already initiated. we just retrying.
    public string? Reference { get; set; }
}