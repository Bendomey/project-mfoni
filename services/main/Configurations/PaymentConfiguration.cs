using System.Text;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace main.Configurations;

public class InitPaymentInput
{
    [JsonPropertyName("amount")]
    public required Int64 Amount { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("currency")]
    public string? Currency { get; set; } = "GHS";

    [JsonPropertyName("reference")]
    public string? Reference { get; set; }

    [JsonPropertyName("callback_url")]
    public string? CallbackUrl { get; set; }

    [JsonPropertyName("metadata")]
    public string? Metadata { get; set; }

    [JsonPropertyName("channels")]
    public string[]? Channels { get; set; }
}

public class InitPaymentMedataInput
{
    [JsonPropertyName("origin")]
    public string? Origin { get; set; } // ContentPurchase | WalletTopup

    [JsonPropertyName("content_purchase_id")]
    public string? ContentPurchaseId { get; set; }

    [JsonPropertyName("wallet_id")]
    public string? WalletId { get; set; }

    [JsonPropertyName("custom_field")]
    public InitPaymentMedataCustomFieldsInput[]? CustomFields { get; set; }

}

public class InitPaymentMedataCustomFieldsInput
{
    [JsonPropertyName("display_name")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("variable_name")]
    public string? VariableName { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

}

public class InitPaymentResponse
{
    [JsonPropertyName("data")]
    public InitPaymentResponseData? Data { get; set; }

    [JsonPropertyName("status")]
    public required bool Status { get; set; }

    [JsonPropertyName("message")]
    public required string Message { get; set; }
}

public class InitPaymentResponseData
{
    [JsonPropertyName("authorization_url")]
    public required string AuthorizationUrl { get; set; }

    [JsonPropertyName("access_code")]
    public required string AccessCode { get; set; }

    [JsonPropertyName("reference")]
    public required string Reference { get; set; }
}

public class PaymentConfiguration
{
    public static async Task<InitPaymentResponseData?> Initiate(string ApiKey, InitPaymentInput input)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                string apiKey = ApiKey;

                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

                var jsonContent = JsonConvert.SerializeObject(input);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://api.paystack.co/transaction/initialize", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObject = JsonConvert.DeserializeObject<InitPaymentResponse>(responseContent);

                if (responseObject != null && !responseObject.Status)
                {
                    throw new Exception(responseObject.Message);
                }

                return responseObject?.Data;
            }

        }
        catch (System.Exception e)
        {

            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Initiate Payment with Paystack"},
               });
               SentrySdk.CaptureException(e);
           });
        }

        return null;
    }
}

