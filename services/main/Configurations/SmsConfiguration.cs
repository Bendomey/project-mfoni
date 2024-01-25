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

        string jsonBody = "{\n    \"from\": \"Mfoni\",\n    \"to\": \"{phoneNumber}\",\n    \"type\": \"1\",\n    \"message\": \"{message}\",\n    \"app_id\":  \"{app_id}\",\n    \"app_secret\": \"{app_secret}\"\n}"
            .Replace("{phoneNumber}", input.PhoneNumber)
            .Replace("{message}", input.Message)
            .Replace("{app_id}", input.AppId)
            .Replace("{app_secret}", input.AppSecret);

        await Send(jsonBody);
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

