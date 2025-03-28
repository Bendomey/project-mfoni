using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Lib;
using main.Middlewares;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Any;
using Newtonsoft.Json;

namespace main.Controllers;

[ApiController]
[Route("api/v1/transfers")]
public class TransferController : ControllerBase
{
    private readonly ILogger<TransferController> _logger;
    private readonly TransferService _transferService;
    private readonly AppConstants _appConstantsConfiguration;

    public TransferController(
        ILogger<TransferController> logger,
        IOptions<AppConstants> appConstants,
        TransferService transferService
    )
    {
        _logger = logger;
        _transferService = transferService;
        _appConstantsConfiguration = appConstants.Value;
    }

    /// <summary>
    /// Initiate a transfer
    /// </summary>
    /// <param name="input"></param>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(OutputResponse<Models.Transfer>), StatusCodes.Status201Created)]
    public async Task<IActionResult> InitiateTransfer(
        [FromBody] DTOs.InitiateTransferInput input
    )
    {
        var updatedAmount = MoneyLib.ConvertCedisToPesewas(input.Amount);

        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var transfer = await _transferService.InitiateTransfer(new Domains.InitiateTransferInput
            {
                Amount = updatedAmount,
                TransferRecipientId = input.TransferRecipientId,
                Reason = input.Reason,
                CreatedById = currentUser.Id,
                Reference = input.Reference
            });

            if (transfer == null)
            {
                throw new HttpRequestException("Failed to initiate transfer.");
            }

            return new ObjectResult(
                new GetEntityResponse<Models.Transfer>(transfer, null).Result()
            )
            {
                StatusCode = StatusCodes.Status201Created
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<object>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"initiate transfer. Exception: {e}");

            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "initiate transfer"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"input", JsonConvert.SerializeObject(input)}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }


    /// <summary>
    /// Create recipient for transfer
    /// </summary>
    /// <param name="input"></param>
    [Authorize]
    [HttpPost("recipients")]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(OutputResponse<Models.TransferRecipient>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateRecipient(
        [FromBody] DTOs.CreateTransferRecipientInput input
    )
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var recipient = await _transferService.CreateTransferRecipient(new Domains.CreateTransferRecipientInput
            {
                AccountName = input.AccountName,
                AccountNumber = input.AccountNumber,
                BankCode = input.BankCode,
                BankName = input.BankName,
                RecipientCode = input.RecipientCode,
                Type = input.Type,
                CreatedById = currentUser.Id
            });

            if (recipient == null)
            {
                throw new HttpRequestException("Failed to create transfer recipient");
            }

            return new ObjectResult(
                new GetEntityResponse<Models.TransferRecipient>(recipient, null).Result()
            )
            {
                StatusCode = StatusCodes.Status201Created
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<object>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Create transfer recipient. Exception: {e}");

            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Create transfer recipient"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"input", JsonConvert.SerializeObject(input)}
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(500);
        }
    }


    /// <summary>
    /// Delete recipient for transfer
    /// </summary>
    /// <param name="recipientId"></param>
    [Authorize]
    [HttpDelete("recipients/{recipientId}")]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(OutputResponse<AnyType?>), StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteRecipient(
        [FromRoute] string recipientId
    )
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            await _transferService.DeleteTransferRecipient(new Domains.DeleteTransferRecipientInput
            {
                TransferRecipientId = recipientId,
                CreatedById = currentUser.Id
            });

            return new ObjectResult(
                new GetEntityResponse<AnyType?>(null, null).Result()
            )
            {
                StatusCode = StatusCodes.Status204NoContent
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<object>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Delete transfer recipient. Exception: {e}");

            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Delete transfer recipient"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"recipientId", recipientId}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all user's transfer recipients.
    /// </summary>
    /// <param name="bankCode">Bank Code of the bank.</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Transfer Recipients Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpGet("recipients")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<Models.TransferRecipient>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetRecipients(
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string? bankCode,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            _logger.LogInformation("Getting all user's transfer recipients");
            var userId = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id;
            var queryFilter = HttpLib.GenerateFilterQuery<Models.TransferRecipient>(page, pageSize, sort, sortBy, populate);
            var contents = await _transferService.GetTransferRecipients(queryFilter, new GetTransferRecipientInput
            {
                CreatedById = userId,
                BankCode = bankCode
            });

            long count = await _transferService.CountTransferRecipients(new GetTransferRecipientInput
            {
                CreatedById = userId,
                BankCode = bankCode
            });


            var response = HttpLib.GeneratePagination(
                contents,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<Models.TransferRecipient>>(response, null).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
            };
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
            this._logger.LogError($"Failed to get user's transfer recipients. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get user's transfer recipients"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"populate", StringLib.SafeString(populate)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"bankCode", StringLib.SafeString(bankCode)},
              });

              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }
}