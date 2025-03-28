using System.Security.Cryptography;
using System.Text;
using main.Configuratons;
using main.Domains;
using main.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace main.Controllers;

[ApiController]
[Route("api/v1/payments")]
public class PaymentController : ControllerBase
{
    private readonly ILogger<PaymentController> _logger;
    private readonly PaymentService _paymentService;
    private readonly TransferService _transferService;
    private readonly AppConstants _appConstantsConfiguration;

    public PaymentController(
        ILogger<PaymentController> logger,
        IOptions<AppConstants> appConstants,
        PaymentService paymentService,
        TransferService transferService
    )
    {
        _logger = logger;
        _paymentService = paymentService;
        _transferService = transferService;
        _appConstantsConfiguration = appConstants.Value;
    }

    [HttpPost("paystack/verify")]
    public async Task<IActionResult> VerifyTransactionFromPaystack()
    {
        using var reader = new StreamReader(Request.Body);
        var requestBody = await reader.ReadToEndAsync();

        var xpaystackSignature = Request.Headers["x-paystack-signature"].ToString();

        var isRequestFromPaystack = VerifySignature(requestBody, xpaystackSignature);

        if (isRequestFromPaystack)
        {
            var eventData = JsonConvert.DeserializeObject<PaystackWebhookInput>(requestBody);

            if (eventData != null)
            {
                _logger.LogInformation($"Received Paystack event: {eventData.Event}");

                switch (eventData.Event)
                {
                    case "charge.success":
                        try
                        {
                            await _paymentService.VerifyPayment(eventData);
                        }
                        catch (System.Exception e)
                        {

                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Payment"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(e);
                            });
                        }
                        break;
                    case "transfer.success":
                        try
                        {
                            await _transferService.VerifySuccessTransfer(eventData.Data.Reference);
                        }
                        catch (System.Exception e)
                        {
                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Success Transfer"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(e);
                            });
                        }
                        break;
                    case "transfer.failed":
                        try
                        {
                            await _transferService.VerifyFailedTransfer(eventData.Data.Reference);
                        }
                        catch (System.Exception e)
                        {
                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Failed Transfer"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(e);
                            });
                        }
                        break;
                    case "transfer.reversed":
                        try
                        {
                            await _transferService.VerifyReverseTransfer(eventData.Data.Reference);
                        }
                        catch (System.Exception e)
                        {
                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Reversed Transfer"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(e);
                            });
                        }
                        break;
                    default:
                        SentrySdk.ConfigureScope(scope =>
                        {
                            scope.SetTags(new Dictionary<string, string>
                            {
                                {"action", "Unhandled Paystack event"},
                                {"event", eventData.Event},
                                {"id", eventData.Data.Id.ToString()},
                                {"reference", eventData.Data.Reference},
                            });
                        });

                        _logger.LogInformation($"Unhandled Paystack event: {eventData.Event}");
                        break;
                }
            }


        }

        return Ok();
    }

    private bool VerifySignature(string requestBody, string signature)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(_appConstantsConfiguration.PaystackSecretKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(requestBody));
        var computedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        return computedSignature == signature;
    }
}