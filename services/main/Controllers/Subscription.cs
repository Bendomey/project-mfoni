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
public class SubscriptionController : ControllerBase
{
    private readonly ILogger<UserController> logger;
    private readonly WalletService walletService;
    private readonly UserService userService;
    private readonly UserTransformer _userTransformer;
    private readonly WalletTransactionTransformer _walletTransactionTransformer;
    private readonly CreatorApplicationService _creatorApplicationService;
    private readonly CreatorService _creatorService;
    private readonly SubscriptionService _subscriptionService;
    private readonly CreatorApplicationTransformer _creatorApplicationTransformer;
    private readonly CreatorTransformer _creatorTransformer;
    private readonly CreatorSubscriptionTransformer _creatorSubscriptionTransformer;

    public SubscriptionController(
        ILogger<UserController> logger,
        UserService userService,
        WalletService walletService,
        CreatorApplicationService creatorApplicationService,
        CreatorService creatorService,
        SubscriptionService subscriptionService,
        CreatorApplicationTransformer creatorApplicationTransformer,
        CreatorTransformer creatorTransformer,
        CreatorSubscriptionTransformer creatorSubscriptionTransformer,
        UserTransformer userTransformer,
        WalletTransactionTransformer walletTransactionTransformer
    )
    {
        this.logger = logger;
        this._creatorService = creatorService;
        this._subscriptionService = subscriptionService;
        this.userService = userService;
        this.walletService = walletService;
        this._creatorApplicationService = creatorApplicationService;
        this._creatorApplicationTransformer = creatorApplicationTransformer;
        this._creatorTransformer = creatorTransformer;
        this._creatorSubscriptionTransformer = creatorSubscriptionTransformer;
        this._userTransformer = userTransformer;
        this._walletTransactionTransformer = walletTransactionTransformer;
    }

    /// <summary>
    /// Retrieves all subscriptions of a user
    /// </summary>
    /// <param name="type">Can be `FREE` or `BASIC` or `ADVANCED`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Transactions Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpGet("subscriptions")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputUser>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetSubscriptions(
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
            logger.LogInformation("Getting all subscriptions");
            var queryFilter = HttpLib.GenerateFilterQuery<CreatorSubscription>(page, pageSize, sort, sortBy, populate);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            logger.LogInformation($"Current user is {currentUser.Id}");
            var creator = await _creatorService.GetCreatorByUserId(currentUser.Id);

            var input = new GetSubscriptionsInput
            {
                CreatorId = creator.Id,
                PackageType = type
            };
            var transactions = await _subscriptionService.GetSubscriptions(queryFilter, input);
            long count = await _subscriptionService.CountSubscriptions(input);

            var outputTransactions = new List<OutputCreatorSubscription>();
            foreach (var transaction in transactions)
            {
                outputTransactions.Add(await _creatorSubscriptionTransformer.Transform(transaction, populate: queryFilter.Populate));
            }

            var response = HttpLib.GeneratePagination<OutputCreatorSubscription, CreatorSubscription>(
                outputTransactions,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCreatorSubscription>>(response, null).Result()
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

