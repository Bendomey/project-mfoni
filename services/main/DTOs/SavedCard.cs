using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class InitiateCardSaveInput
{
    /// <summary>
    /// Billing Email - The email associated with the card to be saved.
    /// </summary>
    [Required]
    public required string BillingEmail { get; set; }
}
