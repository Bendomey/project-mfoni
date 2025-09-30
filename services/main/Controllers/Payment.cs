using System.Net;
using System.Security.Cryptography;
using System.Text;
using main.Configurations;
using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Any;
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
                            await _paymentService.VerifySuccessPayment(eventData);
                        }
                        catch (Exception ex) when (ex is HttpRequestException || ex is Exception)
                        {
                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Payment"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(ex);
                            });
                        }
                        break;
                    case "transfer.success":
                        try
                        {
                            await _transferService.VerifySuccessTransfer(eventData.Data.Reference);
                        }
                        catch (Exception ex) when (ex is HttpRequestException || ex is Exception)
                        {
                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Success Transfer"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(ex);
                            });
                        }
                        break;
                    case "transfer.failed":
                        try
                        {
                            await _transferService.VerifyFailedTransfer(eventData.Data.Reference);
                        }
                        catch (Exception ex) when (ex is HttpRequestException || ex is Exception)
                        {
                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Failed Transfer"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(ex);
                            });
                        }
                        break;
                    case "transfer.reversed":
                        try
                        {
                            await _transferService.VerifyReverseTransfer(eventData.Data.Reference);
                        }
                        catch (Exception ex) when (ex is HttpRequestException || ex is Exception)
                        {
                            SentrySdk.ConfigureScope(scope =>
                            {
                                scope.SetTags(new Dictionary<string, string>
                                {
                                        {"action", "Verify Reversed Transfer"},
                                        {"reference", eventData.Data.Reference},
                                });
                                SentrySdk.CaptureException(ex);
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

    /// <summary>
    /// Retry payment verification
    /// </summary>
    /// <param name="reference">reference of payment</param>
    /// <response code="200">Payment Verified Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost("references/{reference}/verify")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputManualVerifyPayment>)
    )]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> ManualPaymentVerification(string reference)
    {
        try
        {
            // find payment record by reference
            await _paymentService.GetByReference(reference);

            // call paystack verify
            var verifyResponse = await PaystackVerifyTransactionConfiguration.Call(_appConstantsConfiguration.PaystackSecretKey, reference);
            if (verifyResponse == null || !verifyResponse.Status)
            {
                throw new HttpRequestException("Payment verification failed", null, HttpStatusCode.BadRequest);
            }

            // update payment record based on status: https://paystack.com/docs/payments/verify-payments/
            OutputManualVerifyPayment response = new OutputManualVerifyPayment
            {
                TransactionStatus = verifyResponse?.Data.Status ?? "unknown",
            };

            switch (verifyResponse?.Data.Status)
            {
                case "success":
                    // update payment record as successful
                    await _paymentService.VerifySuccessPayment(new PaystackWebhookInput
                    {
                        Event = "charge.success",
                        Data = verifyResponse.Data
                    });
                    response.Message = verifyResponse?.Data.Message ?? "Payment verified and processed successfully";
                    break;

                case "failed":
                    // update payment record as failed
                    await _paymentService.VerifyFailedPayment(new DTOs.PaystackWebhookInput
                    {
                        Event = "charge.failed",
                        Data = verifyResponse.Data
                    });
                    response.Message = verifyResponse?.Data.Message ?? "Payment verification failed";
                    break;

                case "abandoned":
                    // update payment record as failed
                    await _paymentService.VerifyCancelledPayment(new DTOs.PaystackWebhookInput
                    {
                        Event = "charge.abandoned",
                        Data = verifyResponse.Data
                    });
                    response.Message = verifyResponse?.Data.Message ?? "Payment Cancelled";
                    break;

                default:
                    response.Message = verifyResponse?.Data.Message;
                    break;
            }

            return new ObjectResult(new GetEntityResponse<OutputManualVerifyPayment>(response, null).Result()) { StatusCode = StatusCodes.Status200OK };

        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to verify payment by reference {reference}. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get Package by reference"},
                    {"reference", reference}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }


    private bool VerifySignature(string requestBody, string signature)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(_appConstantsConfiguration.PaystackSecretKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(requestBody));
        var computedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        return computedSignature == signature;
    }
}