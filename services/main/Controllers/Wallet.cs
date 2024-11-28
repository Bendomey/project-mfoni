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
    private readonly WalletTransactionTransformer _walletTransactionTransformer;

    public WalletController(
        ILogger<UserController> logger,
        WalletService walletService,
        WalletTransactionTransformer walletTransactionTransformer
    )
    {
        this.logger = logger;
        this.walletService = walletService;
        this._walletTransactionTransformer = walletTransactionTransformer;
    }

    /// <summary>
    /// Retrieves all wallet transactions of a user
    /// </summary>
    /// <param name="type">Can be `DEPOSIT` or `WITHDRAW`</param>
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
    public async Task<IActionResult> GetWalletTransactions(
        [FromQuery] string? type,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all wallet transactions");
            var queryFilter = HttpLib.GenerateFilterQuery<WalletTransaction>(page, pageSize, sort, sortBy);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            logger.LogInformation($"Current user is {currentUser.Id}");
            var input = new GetWalletTransactionsInput
            {
                UserId = currentUser.Id,
                Type = type
            };
            var transactions = await walletService.GetWalletTransactions(queryFilter, input);
            long count = await walletService.CountWalletTransactions(input);

            var outputTransactions = transactions.ConvertAll<OutputWalletTransaction>(
                new Converter<WalletTransaction, OutputWalletTransaction>(wal => _walletTransactionTransformer.Transform(wal))
            );
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
            logger.LogError($"An error occured {e}");
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


}

