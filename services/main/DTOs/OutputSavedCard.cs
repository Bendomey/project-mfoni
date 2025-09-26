
namespace main.DTOs;

public class OutputSavedCard
{
    public required string Id { get; set; }
    public required string UserId { get; set; }
    public DateTime? DefaultedAt { get; set; }
    public required string CardType { get; set; }
    public required string First6 { get; set; }
    public required string Last4 { get; set; }
    public required string ExpiryYear { get; set; }
    public required string ExpiryMonth { get; set; }
    public required string Bank { get; set; }
    public required string Channel { get; set; }
    public required bool Reusable { get; set; }
    public required string CountryCode { get; set; }
    public required string AccountName { get; set; }
    public required string Email { get; set; }
    public required string Status { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}
