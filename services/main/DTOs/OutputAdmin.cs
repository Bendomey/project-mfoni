
namespace main.DTOs;

public class OutputAdmin
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public OutputAdmin? CreatedBy { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}