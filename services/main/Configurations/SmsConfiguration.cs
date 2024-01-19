using System.Text;

namespace main.Configurations;

public class SmsConfiguration
{
    public static async Task<string> SendSms(string phoneNumber, string smsText)
    {
        string jsonBody = $@"{{
            ""from"": ""Mfoni"",
            ""to"": ""{phoneNumber}""
            ""type"": ""1"",
            ""message"": ""{smsText}"",
            ""callback_url"": ""http://example.com/handle_callback/"",
            ""app_id"": ""xxx-xxxx-xxxx-xxxxx-xxxxx"",
            ""app_secret"": ""xxyyxyxyxyxyxyxyxyxyxyxyzzz""
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
            HttpResponseMessage response = await client.PostAsync(apiUrl, 
                new StringContent(jsonBody, Encoding.UTF8, "application/json"));

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }

            return response.StatusCode.ToString();
        }
    }
}

