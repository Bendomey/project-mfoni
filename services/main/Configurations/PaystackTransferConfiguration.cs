using System.Text;
using Newtonsoft.Json;

namespace main.Configurations;

public class CreateTransferInput
{

    [JsonProperty("source")]
    public string Source { get; set; } = "balance";

    [JsonProperty("amount")]
    public required Int64 Amount { get; set; }

    [JsonProperty("reference")]
    public string? Reference { get; set; }

    [JsonProperty("recipient")]
    public required string Recipient { get; set; }

    [JsonProperty("reason")]
    public required string Reason { get; set; }
}

public class CreateTransferResponse
{
    [JsonProperty("data")]
    public CreateTransferResponseData? Data { get; set; }

    [JsonProperty("status")]
    public required bool Status { get; set; }

    [JsonProperty("message")]
    public required string Message { get; set; }
}

public class CreateTransferResponseData
{
    [JsonProperty("reference")]
    public required string Reference { get; set; }

    [JsonProperty("integration")]
    public required Int64 Integration { get; set; }

    [JsonProperty("domain")]
    public required string Domain { get; set; }

    [JsonProperty("amount")]
    public required Int64 Amount { get; set; }

    [JsonProperty("currency")]
    public required string Currency { get; set; }

    [JsonProperty("source")]
    public required string Source { get; set; }

    [JsonProperty("reason")]
    public required string Reason { get; set; }

    [JsonProperty("status")]
    public required string Status { get; set; }

    [JsonProperty("transfer_code")]
    public required string TransferCode { get; set; }

    [JsonProperty("id")]
    public required Int64 Id { get; set; }

    [JsonProperty("createdAt")]
    public required DateTime CreatedAt { get; set; }
}

public class PaystackTransferConfiguration
{
    public static async Task<CreateTransferResponseData?> Initiate(string ApiKey, CreateTransferInput input)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                string apiKey = ApiKey;

                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

                var jsonContent = JsonConvert.SerializeObject(input);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://api.paystack.co/transfer", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObject = JsonConvert.DeserializeObject<CreateTransferResponse>(responseContent);

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
                    {"action", "Initiate Transfer  with Paystack"},
               });
               SentrySdk.CaptureException(e);
           });
        }

        return null;
    }
}

