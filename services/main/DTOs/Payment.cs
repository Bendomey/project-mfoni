using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace main.DTOs;

public class PaystackWebhookInput
{
    [JsonPropertyName("event")]
    public required string Event { get; set; }

    [JsonPropertyName("data")]
    public required PaystackWebhookDataInput Data { get; set; }
}

public class PaystackWebhookDataInput
{
    [JsonPropertyName("id")]
    public required Int64 Id { get; set; }

    [JsonPropertyName("status")]
    public required string Status { get; set; }

    [JsonPropertyName("domain")]
    public required string Domain { get; set; }

    [JsonPropertyName("reference")]
    public required string Reference { get; set; }

    // [JsonPropertyName("metadata")]
    // public required string Metadata { get; set; }

    [JsonPropertyName("channel")]
    public required string Channel { get; set; }
}