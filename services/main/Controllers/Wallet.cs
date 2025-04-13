using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using main.DTOs;
using main.Domains;
using main.Middlewares;
using System.Security.Claims;
using System.Net;
using main.Transformations;
using Microsoft.OpenApi.Any;
using main.Models;
using main.Lib;

namespace main.Controllers;

[ApiController]
[Route("api/v1")]
public class WalletController : ControllerBase
{
    private readonly ILogger<UserController> logger;
    private readonly WalletService walletService;
    private readonly AdminWalletService _adminWalletService;
    private readonly WalletTransactionTransformer _walletTransactionTransformer;

    public WalletController(
        ILogger<UserController> logger,
        WalletService walletService,
        WalletTransactionTransformer walletTransactionTransformer,
        AdminWalletService adminWalletService
    )
    {
        this.logger = logger;
        this.walletService = walletService;
        this._walletTransactionTransformer = walletTransactionTransformer;
        this._adminWalletService = adminWalletService;
    }

    /// <summary>
    /// Retrieves all wallet transactions of a user
    /// </summary>
    /// <param name="type">Can be `DEPOSIT` or `WITHDRAW`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Transactions Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpGet("wallet-transactions")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputUser>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetWalletTransactions(
        [FromQuery] string? type,
        [FromQuery] string? populate,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all wallet transactions");
            var queryFilter = HttpLib.GenerateFilterQuery<WalletTransaction>(page, pageSize, sort, sortBy, populate);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            logger.LogInformation($"Current user is {currentUser.Id}");
            var input = new GetWalletTransactionsInput
            {
                UserId = currentUser.Id,
                Type = type
            };
            var transactions = await walletService.GetWalletTransactions(queryFilter, input);
            long count = await walletService.CountWalletTransactions(input);

            var transformTasks = transactions.Select(content => _walletTransactionTransformer.Transform(content, populate: queryFilter.Populate));
            var transformedTransactions = await Task.WhenAll(transformTasks);
            var outputTransactions = transformedTransactions.ToList();

            var response = HttpLib.GeneratePagination<OutputWalletTransaction, WalletTransaction>(
                outputTransactions,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputWalletTransaction>>(response, null).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = e.StatusCode ?? HttpStatusCode.BadRequest;
            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            logger.LogError($"Failed to fetch wallet transactions for users. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Wallet transactions for admin"},
                    {"type", StringLib.SafeString(type)},
                    {"populate", StringLib.SafeString(populate)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", StringLib.SafeString(sortBy)}

                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


    /// <summary>
    /// Retrieves all wallet transactions of an admin
    /// </summary>
    /// <param name="type">Can be `DEPOSIT` or `WITHDRAW`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Transactions Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "admin")]
    [HttpGet("admins/wallet-transactions")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputWalletTransaction>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetWalletTransactionsForAdmin(
        [FromQuery] string? type,
        [FromQuery] string? populate,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all wallet transactions for admin");
            var queryFilter = HttpLib.GenerateFilterQuery<WalletTransaction>(page, pageSize, sort, sortBy, populate);
            var adminWallet = await _adminWalletService.Get();

            var input = new GetWalletTransactionsInput
            {
                UserId = adminWallet.Id,
                Type = type
            };
            var transactions = await walletService.GetWalletTransactions(queryFilter, input);
            long count = await walletService.CountWalletTransactions(input);

            var transformTasks = transactions.Select(transaction => _walletTransactionTransformer.Transform(transaction, populate: queryFilter.Populate));
            var transformedTransactions = await Task.WhenAll(transformTasks);
            var outputTransactions = transformedTransactions.ToList();

            var response = HttpLib.GeneratePagination<OutputWalletTransaction, WalletTransaction>(
                outputTransactions,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputWalletTransaction>>(response, null).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = e.StatusCode ?? HttpStatusCode.BadRequest;
            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            logger.LogError($"Failed to fetch wallet transactions for admin. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Wallet transactions for admin"},
                    {"type", StringLib.SafeString(type)},
                    {"populate", StringLib.SafeString(populate)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", StringLib.SafeString(sortBy)}

                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Retrieves wallet of an admin
    /// </summary>
    /// <response code="200">Transaction balance Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "admin")]
    [HttpGet("admins/wallet")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputAdminWallet>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetWalletForAdmin()
    {
        try
        {
            logger.LogInformation("Getting wallet for admin");
            var adminWallet = await _adminWalletService.Get();

            return new ObjectResult(
                new GetEntityResponse<OutputAdminWallet>(new OutputAdminWallet
                {
                    Id = adminWallet.Id,
                    Wallet = adminWallet.Wallet,
                    BookWallet = adminWallet.BookWallet,
                    CreatedAt = adminWallet.CreatedAt,
                    UpdatedAt = adminWallet.UpdatedAt
                }, null).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = e.StatusCode ?? HttpStatusCode.BadRequest;
            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            logger.LogError($"Failed to fetch wallet for admin. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Wallet transactions for admin"},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


}

