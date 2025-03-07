using Newtonsoft.Json;

namespace main.DTOs;

public class PaystackWebhookInput
{
    [JsonProperty("event")]
    public required string Event { get; set; }

    [JsonProperty("data")]
    public required PaystackWebhookDataInput Data { get; set; }
}

public class PaystackWebhookDataInput
{
    [JsonProperty("id")]
    public required Int64 Id { get; set; }

    [JsonProperty("status")]
    public required string Status { get; set; }

    [JsonProperty("domain")]
    public required string Domain { get; set; }

    [JsonProperty("reference")]
    public required string Reference { get; set; }

    // [JsonProperty("metadata")]
    // public required string Metadata { get; set; }

    [JsonProperty("channel")]
    public required string Channel { get; set; }
}