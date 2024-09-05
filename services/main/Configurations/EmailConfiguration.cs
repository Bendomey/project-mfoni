using System.Text;
using Newtonsoft.Json;

namespace main.Configurations;

public class SendEmailInput
{
    public required string From { get; set; }
    public required string Email { get; set; }
    public required string Subject { get; set; }
    public required string Message { get; set; }
    public required string ApiKey { get; set; }
}

public class EmailConfiguration
{
    public static async Task Send(SendEmailInput input)
    {
        using (HttpClient client = new HttpClient())
        {
            string apiKey = input.ApiKey;

            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var emailData = new
            {
                from = input.From,
                to = new[] { input.Email },
                subject = input.Subject,
                text = input.Message
            };

            var jsonContent = JsonConvert.SerializeObject(emailData);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://api.resend.com/emails", content);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("Email sent successfully: " + await response.Content.ReadAsStringAsync());
            }
            else
            {
                Console.WriteLine($"Failed to send email. Status code: {response.StatusCode}");
                Console.WriteLine(await response.Content.ReadAsStringAsync());
            }
        }
    }
}

