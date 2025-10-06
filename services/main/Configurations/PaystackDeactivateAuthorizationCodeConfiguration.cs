using System.Text;
using Newtonsoft.Json;

namespace main.Configurations;

public class DeactivateAuthorizationCodeInput
{
    [JsonProperty("authorization_code")]
    public required string AuthorizationCode { get; set; }
}

public class DeactivateAuthorizationCodeResponse
{
    [JsonProperty("status")]
    public required bool Status { get; set; }

    [JsonProperty("message")]
    public required string Message { get; set; }
}

public class PaystackDeactivateAuthorizationCodeConfiguration
{
    public static async Task<DeactivateAuthorizationCodeResponse?> Call(string ApiKey, DeactivateAuthorizationCodeInput input)
    {
        try
        {
            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {ApiKey}");

                var json = JsonConvert.SerializeObject(input);
                var data = new StringContent(json, Encoding.UTF8, "application/json");

                var url = "https://api.paystack.co/customer/authorization/deactivate";
                var response = await client.PostAsync(url, data);

                var result = await response.Content.ReadAsStringAsync();
                var responseData = JsonConvert.DeserializeObject<DeactivateAuthorizationCodeResponse>(result);

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
                    {"action", "Deactivate Authorization Code with Paystack"},
              });
              SentrySdk.CaptureException(e);
          });
        }

        return null;
    }
}