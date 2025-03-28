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
