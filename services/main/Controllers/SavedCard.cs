using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using main.DTOs;
using main.Domains;
using main.Middlewares;
using System.Security.Claims;
using System.Net;
using main.Transformations;
using Microsoft.OpenApi.Any;
using main.Lib;

namespace main.Controllers;

[ApiController]
[Route("api/v1/saved-cards")]
[Authorize]
public class SavedCardController : ControllerBase
{
    private readonly ILogger<SavedCardController> _logger;
    private readonly PaymentService _paymentService;
    private readonly SavedCardService _savedCardService;
    private readonly SavedCardTransformer _savedCardTransformer;
    private readonly PaymentTransformer _paymentTransformer;

    public SavedCardController(
        ILogger<SavedCardController> logger,
        SavedCardService savedCardService,
        PaymentService paymentService,
        SavedCardTransformer savedCardTransformer,
        PaymentTransformer paymentTransformer
    )
    {
        _logger = logger;
        _savedCardService = savedCardService;
        _savedCardTransformer = savedCardTransformer;
        _paymentService = paymentService;
        _paymentTransformer = paymentTransformer;
    }

    /// <summary>
    /// Initiate payment to get card details from payment provider.
    /// </summary>
    /// <response code="201"></response>
    /// <response code="400"></response>
    /// <response code="401"></response>
    /// <response code="500">An unexpected error occured</response>
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<OutputPayment>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> InitiateCardCreation([FromBody] DTOs.InitiateCardSaveInput input)
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var paymentDetails = await _paymentService.InitiateSavedCardCreation(new InitializeSavedCardInput
            {
                UserId = currentUser.Id,
                BillingEmail = input.BillingEmail
            });
            return new ObjectResult(new GetEntityResponse<OutputPayment>(_paymentTransformer.Transform(paymentDetails, null), null).Result()) { StatusCode = StatusCodes.Status201Created };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputPayment>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to initiate card creation. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "initiate card creation"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get card by id
    /// </summary>
    /// <param name="id">id of SavedCard</param>
    /// <response code="200">SavedCard Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputSavedCard>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> Get(string id)
    {
        try
        {
            _logger.LogInformation("Getting card: " + id);
            var savedCard = await _savedCardService.GetById(id);

            var outputTag = _savedCardTransformer.Transform(savedCard);
            return new ObjectResult(new GetEntityResponse<OutputSavedCard>(outputTag, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.ReportContentCase>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get card. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get SavedCard by id"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all saved cards for a user.
    /// </summary>
    /// <param name="status">filter by status `SavedCard.Status.Active` or `SavedCard.Status.Inactive`</param>
    /// <param name="reusable">filter by reusable `true` or `false`</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">SavedCards Retrieved Successfully</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputSavedCard>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? reusable,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string status = "SavedCard.Status.Active"
    )
    {
        try
        {
            _logger.LogInformation("Getting all SavedCards");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);

            var queryFilter = HttpLib.GenerateFilterQuery<Models.SavedCard>(page, pageSize, sort, sortBy, "");
            var input = new GetSavedCardsInput
            {
                UserId = currentUser.Id,
                Status = status,
                Reusable = reusable
            };

            var cards = await _savedCardService.GetAll(queryFilter, input);
            var cardsCount = await _savedCardService.Count(input);

            var outputCards = cards.ConvertAll<OutputSavedCard>(
                new Converter<Models.SavedCard, OutputSavedCard>(_savedCardTransformer.Transform)
            );

            var response = HttpLib.GeneratePagination(outputCards, cardsCount, queryFilter);
            return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputSavedCard>>(response, null).Result()) { StatusCode = (int)HttpStatusCode.OK };
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
            this._logger.LogError($"Failed to get cards. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get All Cards"},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"status", StringLib.SafeString(status)},
                    {"reusable", reusable.HasValue ? reusable.Value.ToString() : "null"},
                });

                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Delete saved card
    /// </summary>
    /// <response code="200">SavedCard Deleted Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(OutputResponse<AnyType?>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteCard([FromRoute] string id)
    {

        try
        {
            _logger.LogInformation("deleting saved card: " + id);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);

            await _savedCardService.Remove(id, currentUser.Id);

            return NoContent();
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<object>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to delete saved card. Exception: {e}");

            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Delete SavedCard"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"id", id},
                });
                SentrySdk.CaptureException(e);
            });

            return new StatusCodeResult(500);
        }
    }

}