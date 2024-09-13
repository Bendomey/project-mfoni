namespace main.DTOs;

public class SetupAccountInput
{
    public required string Role { get; set; } // 'CLIENT' | 'CREATOR'
    public required string Name { get; set; }
    public string? IntendedPricingPackage { get; set; }  // FREE | BASIC | ADVANCED
}
