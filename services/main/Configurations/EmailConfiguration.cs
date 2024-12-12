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
        try
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
                response.EnsureSuccessStatusCode();
                Console.WriteLine("Email sent successfully: " + await response.Content.ReadAsStringAsync());
            }

        }
        catch (System.Exception e)
        {

            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Send Email with Resend"},
               });
               SentrySdk.CaptureException(e);
           });
        }
    }
}

