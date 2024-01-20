using System.Text;

namespace main.Configurations;

public class SmsConfiguration
{
    public static async Task<string> SendSms(string phoneNumber, string smsText)
    {
        IConfiguration configuration = AppSettingsDevConfiguration.DevConfig();

        string jsonBody = $@"{{
            ""from"": ""Mfoni"",
            ""to"": ""{phoneNumber}""
            ""type"": ""1"",
            ""message"": ""{smsText}"",
            ""app_id"": ""{configuration["AppConstants.SmsAppId"]}"",
            ""app_secret"": ""{configuration["AppConstants.SmsAppSecret"]}""
        }}";

        string apiUrl = "https://api.wittyflow.com/v1/messages/send";
        var response = await PostRequest(apiUrl, jsonBody);

        return response;
    }

    public static async Task<string> PostRequest(string apiUrl, string jsonBody)
    {
        using (HttpClient client = new HttpClient())
        {
            client.DefaultRequestHeaders.Add("Content-Type", "application/json");
            HttpResponseMessage response = await client.PostAsync(apiUrl, new StringContent(jsonBody, Encoding.UTF8, "application/json"));

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }

            return response.StatusCode.ToString();
        }
    }
}

