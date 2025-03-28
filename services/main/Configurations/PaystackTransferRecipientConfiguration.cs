using System.Text;
using Newtonsoft.Json;

namespace main.Configurations;

public class CreateRecipientInput
{
    [JsonProperty("type")]
    public required string Type { get; set; }

    [JsonProperty("name")]
    public required string Name { get; set; }

    [JsonProperty("currency")]
    public string Currency { get; set; } = "GHS";

    [JsonProperty("account_number")]
    public required string AccountNumber { get; set; }

    [JsonProperty("bank_code")]
    public required string BankCode { get; set; }
}

public class CreateRecipientResponse
{
    [JsonProperty("data")]
    public CreateRecipientResponseData? Data { get; set; }

    [JsonProperty("status")]
    public required bool Status { get; set; }

    [JsonProperty("message")]
    public required string Message { get; set; }
}

public class CreateRecipientResponseData
{
    [JsonProperty("active")]
    public required bool Active { get; set; }

    [JsonProperty("currency")]
    public string Currency { get; set; } = "GHS";

    [JsonProperty("description")]
    public string? Description { get; set; }

    [JsonProperty("domain")]
    public required string Domain { get; set; }

    [JsonProperty("id")]
    public required Int64 Id { get; set; }

    [JsonProperty("integration")]
    public required Int64 Integration { get; set; }

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("name")]
    public required string Name { get; set; }

    [JsonProperty("recipient_code")]
    public required string RecipientCode { get; set; }

    [JsonProperty("type")]
    public required string Type { get; set; }

    [JsonProperty("createdAt")]
    public required DateTime CreatedAt { get; set; }
}

public class PaystackTransferRecipientConfiguration
{
    public static async Task<CreateRecipientResponseData?> CreateRecipient(string ApiKey, CreateRecipientInput input)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                string apiKey = ApiKey;

                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

                var jsonContent = JsonConvert.SerializeObject(input);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://api.paystack.co/transferrecipient", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObject = JsonConvert.DeserializeObject<CreateRecipientResponse>(responseContent);

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
                    {"action", "Create Transfer Recipient with Paystack"},
               });
               SentrySdk.CaptureException(e);
           });
        }

        return null;
    }
}

