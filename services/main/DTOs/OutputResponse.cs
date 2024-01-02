
namespace main.DTOs;

public class OutputResponse<T>
{
    public bool Status { get; set; } = false;
    public string? ErrorMessage { get; set; }
    public T? Data { get; set; }
}