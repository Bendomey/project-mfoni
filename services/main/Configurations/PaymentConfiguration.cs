using System.Text;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace main.Configurations;

public class InitPaymentInput
{
    [JsonProperty("amount")]
    public required Int64 Amount { get; set; }

    [JsonProperty("email")]
    public required string Email { get; set; }

    [JsonProperty("currency")]
    public string? Currency { get; set; } = "GHS";

    [JsonProperty("reference")]
    public string? Reference { get; set; }

    [JsonProperty("callback_url")]
    public string? CallbackUrl { get; set; }

    [JsonProperty("metadata")]
    public string? Metadata { get; set; }

    [JsonProperty("channels")]
    public string[]? Channels { get; set; }
}

public class InitPaymentMedataInput
{
    [JsonProperty("origin")]
    public string? Origin { get; set; } // ContentPurchase | WalletTopup

    [JsonProperty("content_purchase_id")]
    public string? ContentPurchaseId { get; set; }

    [JsonProperty("wallet_id")]
    public string? WalletId { get; set; }

    [JsonProperty("custom_field")]
    public InitPaymentMedataCustomFieldsInput[]? CustomFields { get; set; }

}

public class InitPaymentMedataCustomFieldsInput
{
    [JsonProperty("display_name")]
    public string? DisplayName { get; set; }

    [JsonProperty("variable_name")]
    public string? VariableName { get; set; }

    [JsonProperty("value")]
    public string? Value { get; set; }

}

public class InitPaymentResponse
{
    [JsonProperty("data")]
    public InitPaymentResponseData? Data { get; set; }

    [JsonProperty("status")]
    public required bool Status { get; set; }

    [JsonProperty("message")]
    public required string Message { get; set; }
}

public class InitPaymentResponseData
{
    [JsonProperty("authorization_url")]
    public required string AuthorizationUrl { get; set; }

    [JsonProperty("access_code")]
    public required string AccessCode { get; set; }

    [JsonProperty("reference")]
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

