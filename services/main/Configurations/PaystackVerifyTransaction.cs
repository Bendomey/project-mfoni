using main.DTOs;
using Newtonsoft.Json;

namespace main.Configurations;

public class PaystackVerifyTransactionResponse
{
    [JsonProperty("status")]
    public required bool Status { get; set; }

    [JsonProperty("message")]
    public required string Message { get; set; }

    [JsonProperty("data")]
    public required PaystackWebhookDataInput Data { get; set; }
}

public class PaystackVerifyTransactionConfiguration
{
    public static async Task<PaystackVerifyTransactionResponse?> Call(string ApiKey, string reference)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {ApiKey}");

                var url = "https://api.paystack.co/transaction/verify/{reference}".Replace("{reference}", reference);
                var response = await client.GetAsync(url);

                var result = await response.Content.ReadAsStringAsync();
                var responseData = JsonConvert.DeserializeObject<PaystackVerifyTransactionResponse>(result);

                if (responseData != null && !responseData.Status)
                {
                    throw new Exception(responseData.Message);
                }

                return responseData;
            }
        }
        catch (Exception e)
        {
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Verify Transaction with Paystack"},
              });
              SentrySdk.CaptureException(e);
          });
        }

        return null;
    }
}