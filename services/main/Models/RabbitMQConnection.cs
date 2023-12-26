namespace main.Models;

public class RabbitMQConnection
{
    public string HostName { get; set; } = null!;
    public string? UserName { get; set; }
    public string? Password { get; set; }

}