using Newtonsoft.Json;

namespace main.Configurations;

public class SendSmsInput
{
    public required string PhoneNumber { get; set; }
    public required string Message { get; set; }
    public required string AppId { get; set; }
    public required string AppSecret { get; set; }
}

public class SmsConfiguration
{
    public static async Task SendSms(SendSmsInput input)
    {
        var jsonBody = new
        {
            from = "Mfoni",
            to = input.PhoneNumber,
            type = "1",
            message = input.Message,
            app_id = input.AppId,
            app_secret = input.AppSecret,
        };

        var jsonContent = JsonConvert.SerializeObject(jsonBody);
        await Send(jsonContent);
    }

    public static async Task Send(string jsonBody)
    {
        using (HttpClient client = new HttpClient())
        {
            client.BaseAddress = new Uri("https://api.wittyflow.com");

            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "/v1/messages/send");
            request.Content = new StringContent(jsonBody, null, "application/json");

            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            Console.WriteLine("Response: {0}", await response.Content.ReadAsStringAsync());
        }
    }
}

