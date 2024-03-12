using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class CreateWaitlistInput
{
    public required string Name { get; set; }
    public required string PhoneNumber { get; set; }
    public string? Email { get; set; }

    [RegularExpression("^(CLIENT|CREATOR)$")]
    public required string UserType { get; set; }
}