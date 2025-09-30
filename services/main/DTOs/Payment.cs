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

    [JsonProperty("message")]
    public string? Message { get; set; }


    [JsonProperty("domain")]
    public required string Domain { get; set; }

    [JsonProperty("reference")]
    public required string Reference { get; set; }

    // [JsonProperty("metadata")]
    // public required string Metadata { get; set; }

    [JsonProperty("log")]
    public required object Log { get; set; }

    [JsonProperty("authorization")]
    public PaystackAuthorizationDataInput? Authorization { get; set; }

    [JsonProperty("customer")]
    public PaystackCustomerDataInput? Customer { get; set; }

    [JsonProperty("channel")]
    public required string Channel { get; set; }
}

public class PaystackAuthorizationDataInput
{
    [JsonProperty("authorization_code")]
    public required string AuthorizationCode { get; set; }

    [JsonProperty("bin")]
    public required string Bin { get; set; }

    [JsonProperty("last4")]
    public required string Last4 { get; set; }

    [JsonProperty("exp_month")]
    public required string ExpiryMonth { get; set; }

    [JsonProperty("exp_year")]
    public required string ExpiryYear { get; set; }

    [JsonProperty("channel")]
    public required string Channel { get; set; }

    [JsonProperty("card_type")]
    public required string CardType { get; set; }

    [JsonProperty("bank")]
    public required string Bank { get; set; }

    [JsonProperty("country_code")]
    public required string CountryCode { get; set; }

    [JsonProperty("brand")]
    public required string Brand { get; set; }

    [JsonProperty("reusable")]
    public required bool Reusable { get; set; }

    [JsonProperty("signature")]
    public required string Signature { get; set; }

    [JsonProperty("account_name")]
    public string? AccountName { get; set; }
}

public class PaystackCustomerDataInput
{
    [JsonProperty("id")]
    public required Int64 Id { get; set; }

    [JsonProperty("first_name")]
    public string? FirstName { get; set; }

    [JsonProperty("last_name")]
    public string? LastName { get; set; }

    [JsonProperty("email")]
    public required string Email { get; set; }

    [JsonProperty("customer_code")]
    public required string CustomerCode { get; set; }

    [JsonProperty("phone")]
    public string? Phone { get; set; }

    [JsonProperty("risk_action")]
    public required string RiskAction { get; set; }

    [JsonProperty("international_format_phone")]
    public string? InternationalFormatPhone { get; set; }
}

public class OutputManualVerifyPayment
{
    public required string TransactionStatus { get; set; }
    public string? Message { get; set; }
}