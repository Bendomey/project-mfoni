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
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> logger;
    private readonly UserService userService;
    private readonly PermissionService _permissionService;
    private readonly UserTransformer _userTransformer;
    private readonly CreatorApplicationService _creatorApplicationService;
    private readonly CreatorService _creatorService;
    private readonly SubscriptionService _subscriptionService;
    private readonly CreatorApplicationTransformer _creatorApplicationTransformer;
    private readonly CreatorTransformer _creatorTransformer;
    private readonly CreatorSubscriptionTransformer _creatorSubscriptionTransformer;
    private readonly WalletTransactionTransformer _walletTransactionTransformer;
    private readonly ContentLikeService _contentLikeService;
    private readonly ContentLikeTransformer _contentLikeTransformer;
    private readonly PaymentTransformer _paymentTransformer;
    private readonly PurchaseContentService _purchaseContentService;
    private readonly ContentPurchaseTransformer _contentPurchaseTransformer;

    public UserController(
        ILogger<UserController> logger,
        UserService userService,
        CreatorApplicationService creatorApplicationService,
        CreatorService creatorService,
        SubscriptionService subscriptionService,
        CreatorApplicationTransformer creatorApplicationTransformer,
        CreatorTransformer creatorTransformer,
        CreatorSubscriptionTransformer creatorSubscriptionTransformer,
        WalletTransactionTransformer walletTransactionTransformer,
        UserTransformer userTransformer,
        ContentLikeService contentLikeService,
        ContentPurchaseTransformer contentPurchaseTransformer,
        ContentLikeTransformer contentLikeTransformer,
        PurchaseContentService purchaseContentService,
        PaymentTransformer paymentTransformer,
        PermissionService permissionService
    )
    {
        this.logger = logger;
        this._creatorService = creatorService;
        this._subscriptionService = subscriptionService;
        this.userService = userService;
        this._creatorApplicationService = creatorApplicationService;
        this._creatorApplicationTransformer = creatorApplicationTransformer;
        this._creatorTransformer = creatorTransformer;
        this._creatorSubscriptionTransformer = creatorSubscriptionTransformer;
        this._userTransformer = userTransformer;
        this._contentLikeService = contentLikeService;
        this._contentLikeTransformer = contentLikeTransformer;
        this._walletTransactionTransformer = walletTransactionTransformer;
        this._paymentTransformer = paymentTransformer;
        this._contentPurchaseTransformer = contentPurchaseTransformer;
        this._purchaseContentService = purchaseContentService;
        _permissionService = permissionService;
    }

    [Authorize]
    [HttpPatch("users/phone")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SavePhoneNumber([FromBody] PhoneNumberInput userPhoneNumber)
    {
        try
        {
            logger.LogInformation($"saving user phone number {userPhoneNumber}");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var savedPhoneNumber = await userService.SavePhoneNumber(userPhoneNumber.phoneNumber, currentUser.Id);
            return new ObjectResult(new GetEntityResponse<bool?>(savedPhoneNumber, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<bool?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            logger.LogError($"Save phone number exception: {e.Message}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPatch("users/phone/verify")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> VerifyPhoneNumber([FromBody] VerificationCodeInput code)
    {
        try
        {
            logger.LogInformation("verifying user phone number");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var verifyPhoneNumber = await userService.VerifyPhoneNumber(code.verificationCode, currentUser.Id);
            return new ObjectResult(new GetEntityResponse<bool?>(verifyPhoneNumber, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<bool?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            logger.LogError($" Verify phone number exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPatch("users/email")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SaveEmailAddress([FromBody] EmailAddressInput userEmailAddress)
    {
        try
        {
            logger.LogInformation($"saving user email address {userEmailAddress}");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var savedEmailAddress = await userService.SaveEmailAddress(userEmailAddress.emailAddress, currentUser.Id);
            return new ObjectResult(new GetEntityResponse<bool?>(savedEmailAddress, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<bool?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            logger.LogError($"Save email address exception: {e.Message}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPatch("users/email/verify")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> VerifyEmailAddress([FromBody] VerificationCodeInput code)
    {
        try
        {
            logger.LogInformation("verifying user email address");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var verifyEmailAddress = await userService.VerifyEmailAddress(code.verificationCode, currentUser.Id);
            return new ObjectResult(new GetEntityResponse<bool?>(verifyEmailAddress, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<bool?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            logger.LogError($"Verify email address exception: {e}");
            return new StatusCodeResult(500);
        }
    }


    [Authorize]
    [HttpGet("users/creator-applications/active")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorApplication>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ActiveUserCreatorApplication()
    {
        try
        {
            logger.LogInformation($"get user's active creator application");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var creatorApplication = await _creatorApplicationService.GetUserActiveCreatorApplication(currentUser.Id);
            return new ObjectResult(
            new GetEntityResponse<OutputCreatorApplication>(await _creatorApplicationTransformer.Transform(creatorApplication), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorApplication>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"get user's active creator application exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPost("creator-applications")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorApplication>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCreatorApplication([FromBody] DTOs.CreateCreatorApplicationInput input)
    {
        try
        {
            logger.LogInformation($"create creator application {input}");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var creatorApplication = await _creatorApplicationService.CreateCreatorApplication(input, currentUser.Id);
            return new ObjectResult(
            new GetEntityResponse<OutputCreatorApplication>(await _creatorApplicationTransformer.Transform(creatorApplication), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorApplication>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"Create creator application exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPatch("creator-applications/{id}")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorApplication>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateCreatorApplication([FromBody] UpdateCreatorApplicationInput input, string id)
    {
        try
        {
            logger.LogInformation($"Update creator application {input}");
            var creatorApplication = await _creatorApplicationService.UpdateCreatorApplication(input, id);
            return new ObjectResult(
            new GetEntityResponse<OutputCreatorApplication>(await _creatorApplicationTransformer.Transform(creatorApplication), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorApplication>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"Update creator application exception: {e}");
            return new StatusCodeResult(500);
        }
    }


    [Authorize]
    [HttpPatch("creator-applications/{id}/submit")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorApplication>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitCreatorApplication(string id)
    {
        try
        {
            logger.LogInformation($"submit creator application {id}");
            var creatorApplication = await _creatorApplicationService.SubmitCreatorApplication(id);
            return new ObjectResult(
            new GetEntityResponse<OutputCreatorApplication>(await _creatorApplicationTransformer.Transform(creatorApplication), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorApplication>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"Submit creator application exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize(Policy = "Admin")]
    [HttpPatch("creator-applications/{id}/approve")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreator>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ApproveCreatorApplication(string id)
    {
        try
        {
            logger.LogInformation($"approve creator application {id}");
            var currentAdmin = CurrentAdmin.GetCurrentAdmin(HttpContext.User.Identity as ClaimsIdentity);
            var creator = await _creatorApplicationService.ApproveCreatorApplication(new ApproveCreatorApplicationInput
            {
                CreatorApplicationId = id
            }, currentAdmin.Id);
            return new ObjectResult(
            new GetEntityResponse<OutputCreator>(await _creatorTransformer.Transform(creator), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreator>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"approve creator application exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize(Policy = "Admin")]
    [HttpPatch("creator-applications/{id}/reject")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorApplication>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RejectCreatorApplication([FromBody] DTOs.RejectCreatorApplicationInput input, string id)
    {
        try
        {
            logger.LogInformation($"reject creator application {id}");
            var currentAdmin = CurrentAdmin.GetCurrentAdmin(HttpContext.User.Identity as ClaimsIdentity);
            var creatorApplication = await _creatorApplicationService.RejectCreatorApplication(new Domains.RejectCreatorApplicationInput
            {
                CreatorApplicationId = id,
                Reason = input.Reason
            }, currentAdmin.Id);
            return new ObjectResult(
            new GetEntityResponse<OutputCreatorApplication>(await _creatorApplicationTransformer.Transform(creatorApplication), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorApplication>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"reject creator application exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all users on the platform
    /// </summary>
    /// <param name="status">Can be `ACTIVE` or `SUSPENDED`</param>
    /// <param name="role">Can be `CLIENT` or `CREATOR`</param>
    /// <param name="provider">Can be `FACEBOOK` or `TWITTER` or `GOOGLE` </param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="search">Search by name</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Users Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpGet("users")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputUser>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetUsersByAdmin(
        [FromQuery] string? status,
        [FromQuery] string? role,
        [FromQuery] string? populate,
        [FromQuery] string? provider,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all users by admins");
            var queryFilter = HttpLib.GenerateFilterQuery<User>(page, pageSize, sort, sortBy, populate);
            var input = new GetUsersInput
            {
                Role = role,
                Status = status,
                Provider = provider,
                Search = search
            };
            var users = await userService.GetUsers(queryFilter, input);
            long count = await userService.CountUsers(input);

            var transformTasks = users.Select(user => _userTransformer.Transform(user, populate: queryFilter.Populate));
            var transformedUsers = await Task.WhenAll(transformTasks);
            var outputUsers = transformedUsers.ToList();

            var response = HttpLib.GeneratePagination<OutputUser, User>(
                outputUsers,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputUser>>(response, null).Result()
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


    /// <summary>
    /// Retrieves all creator applications on the platform
    /// </summary>
    /// <param name="status">Can be `PENDING`, `SUBMITTED`, `REJECTED` or `APPROVED` </param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Creator Applications Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpGet("creator-applications")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputCreatorApplication>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetCreatorsByAdmin(
        [FromQuery] string? status,
        [FromQuery] int? page,
        [FromQuery] string? populate,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all creator applications by admin");
            var queryFilter = HttpLib.GenerateFilterQuery<CreatorApplication>(
                page,
                pageSize,
                sort,
                sortBy,
                populate
            );
            var creatorApplications = await _creatorApplicationService.GetCreatorApplications(
                queryFilter,
                status
            );

            long count = await _creatorApplicationService.CountCreatorApplications(status);

            var transformTasks = creatorApplications.Select(creatorApplication => _creatorApplicationTransformer.Transform(creatorApplication, populate: queryFilter.Populate));
            var transformedApplications = await Task.WhenAll(transformTasks);
            var outCreatorApplications = transformedApplications.ToList();

            var response = HttpLib.GeneratePagination<OutputCreatorApplication, CreatorApplication>(
                outCreatorApplications,
                count,
                queryFilter
            );
            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCreatorApplication>>(
                    response,
                    null
                ).Result()
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

    /// <param name="populate">Comma separated values to populate fields</param>
    [Authorize]
    [HttpGet("creator-subscriptions/active")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorSubscription>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ActiveSubscription(
        [FromQuery] string? populate
    )
    {
        try
        {
            logger.LogInformation($"get active creator subscription");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var creator = await _creatorService.GetCreatorByUserId(currentUser.Id);
            var creatorSubscription = await _subscriptionService.GetActiveCreatorSubscription(creator.Id);

            populate ??= "";
            return new ObjectResult(
                new GetEntityResponse<OutputCreatorSubscription>(await _creatorSubscriptionTransformer.Transform(creatorSubscription, populate: populate.Split(",")), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorSubscription>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"get active subscription failed. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPatch("creator-subscriptions/cancel")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorSubscription>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CancelSubscription()
    {
        try
        {
            logger.LogInformation($"cancel creator subscription");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var creator = await _creatorService.GetCreatorByUserId(currentUser.Id);
            var creatorSubscription = await _subscriptionService.CancelCreatorSubscription(creator.Id);
            return new ObjectResult(
            new GetEntityResponse<OutputCreatorSubscription>(await _creatorSubscriptionTransformer.Transform(creatorSubscription), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorSubscription>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"cancel creator subscription failed. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPatch("creator-subscriptions/activate")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorSubscription>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ActivateSubscription([FromBody] DTOs.ActivateCreatorSubscriptionInput input)
    {
        try
        {
            logger.LogInformation($"activate a creator subscription");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var creator = await _creatorService.GetCreatorByUserId(currentUser.Id);
            var creatorSubscription = await _subscriptionService.ActivateCreatorSubscription(new Domains.ActivateCreatorSubscriptionInput
            {
                CreatorId = creator.Id,
                PricingPackage = input.PricingPackage,
                Period = input.Period,
                UpgradeEffect = input.UpgradeEffect
            });
            return new ObjectResult(
            new GetEntityResponse<OutputCreatorSubscription>(await _creatorSubscriptionTransformer.Transform(creatorSubscription), null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputCreatorSubscription>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"activate a creator subscription failed. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }


    /// <summary>
    /// Retrieves all user's likes on the platform
    /// </summary>
    /// <param name="userId">user's Id</param>
    /// <param name="visibility">can be `ALL`, `PUBLIC`, `PRIVATE`</param>
    /// <param name="orientation">can be `ALL`, `LANDSCAPE`, `PORTRIAT`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="search">Search by name</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Content Likes Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("users/{userId}/likes")]
    [Authorize]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputContentLike>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetUserContentLikes(
        string userId,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string visibility = "PUBLIC",
        [FromQuery] string orientation = "ALL"
    )
    {
        try
        {
            logger.LogInformation("Getting all user's content likes");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.ContentLike>(page, pageSize, sort, sortBy, populate);
            var contents = await _contentLikeService.GetUserContentLikes(queryFilter, new GetContentLikesInput
            {
                UserId = userId,
                Visibility = visibility,
                Orientation = orientation,
            });
            long count = await _contentLikeService.CountUserContentLikes(new GetContentLikesInput
            {
                UserId = userId,
                Visibility = visibility,
                Orientation = orientation,
            });

            var transformTasks = contents.Select(content => _contentLikeTransformer.Transform(content, populate: queryFilter.Populate, userId: userId));
            var transformedContents = await Task.WhenAll(transformTasks);
            var outCreatorContents = transformedContents.ToList();

            var response = HttpLib.GeneratePagination(
                outCreatorContents,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputContentLike>>(response, null).Result()
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
            this.logger.LogError($"Failed to get user's content likes. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get user's content likes"},
                    {"userId", userId},
                    {"populate", StringLib.SafeString(populate)},
                    {"search", StringLib.SafeString(search)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"visibility", visibility},
                    {"orientation", orientation},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


    /// <summary>
    /// Retrieves all user's purchases on the platform
    /// </summary>
    /// <param name="userId">user's Id</param>
    /// <param name="contentId">if you'd want to retrieve by content.</param>
    /// <param name="type">can be `ONE_TIME`, `WALLET`, `SAVED_CARD`</param>
    /// <param name="status">can be `PENDING`, ``SUCCESSFUL, ``FAILED, `CANCELLED`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Content Likes Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("users/{userId}/purchases")]
    [Authorize]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputContentPurchase>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetUserContentPurchases(
        string userId,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string? contentId,
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all user's content purchases");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.ContentPurchase>(page, pageSize, sort, sortBy, populate);
            var contents = await _purchaseContentService.GetContentPurchases(queryFilter, new GetContentPurchasesInput
            {
                UserId = userId,
                ContentId = contentId,
                Status = status,
                Type = type
            });
            long count = await _purchaseContentService.CountContentPurchases(new GetContentPurchasesInput
            {
                UserId = userId,
                ContentId = contentId,
                Status = status,
                Type = type
            });

            var transformTasks = contents.Select(content => _contentPurchaseTransformer.Transform(content, populate: queryFilter.Populate, userId: userId));
            var transformedContents = await Task.WhenAll(transformTasks);
            var outContents = transformedContents.ToList();

            var response = HttpLib.GeneratePagination(
                outContents,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputContentPurchase>>(response, null).Result()
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
            this.logger.LogError($"Failed to get user's content purchases. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get user's content purchases"},
                    {"userId", userId},
                    {"populate", StringLib.SafeString(populate)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"type", StringLib.SafeString(type)},
                    {"status", StringLib.SafeString(status)},
                    {"contentId", StringLib.SafeString(contentId)},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


    /// <summary>
    /// Initiate wallet topup.
    /// </summary>
    /// <param name="input"></param>
    /// <param name="walletTransactionId"></param>
    [Authorize]
    [HttpPost("users/wallets/topup")]
    [ProducesResponseType(typeof(OutputResponse<DTOs.TopupWalletOutput>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> InitiateWalletTopup(
        [FromBody] TopupWalletInput input,
        [FromQuery] string? walletTransactionId
    )
    {

        var amount = MoneyLib.ConvertCedisToPesewas(input.Amount);
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var topupWalletOutput = await userService.InitiateWalletTopup(new Domains.InitiateWalletTopupInput
            {
                Amount = amount,
                UserId = currentUser.Id,
                WalletTransactionId = walletTransactionId
            });

            if (topupWalletOutput == null)
            {
                throw new HttpRequestException("Failed to initiate topup wallet");
            }

            DTOs.TopupWalletOutput res = new();

            if (topupWalletOutput.WalletTransaction != null)
            {
                var outputWalletTransaction = await _walletTransactionTransformer.Transform(topupWalletOutput.WalletTransaction, default);
                res.WalletTransaction = outputWalletTransaction;
            }

            if (topupWalletOutput.Payment != null)
            {
                var outputPayment = _paymentTransformer.Transform(topupWalletOutput.Payment, default);
                res.Payment = outputPayment;
            }

            return new ObjectResult(
                new GetEntityResponse<DTOs.TopupWalletOutput>(res, null).Result()
            )
            {
                StatusCode = StatusCodes.Status200OK
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
            this.logger.LogError($"Initiate wallet topup. Exception: {e}");

            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                     {"action", "Initiate wallet topup"},
                     {"amount", amount.ToString()},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(500);
        }
    }


    /// <summary>
    /// Get Monthly Upload Limit for User
    /// </summary>
    /// <response code="200">Upload Limit returned successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpGet("users/limits/upload")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<UploadLimitForUserForCurrentMonth>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetMonthlyUploadLimitForUser()
    {
        try
        {
            logger.LogInformation("Getting user's upload limit");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var creatorInfo = await _creatorService.GetCreatorDetails(currentUser.Id);

            var uploadLimit = PermissionsHelper.GetNumberOfUploadsForPackageType(creatorInfo.CreatorSubscription.PackageType);
            var yourUploads = await _permissionService.GetMonthlyUploadLimit(creatorInfo);
            var uploadLimitForUser = new UploadLimitForUserForCurrentMonth
            {
                Uploads = yourUploads,
                Limit = uploadLimit
            };

            return new ObjectResult(
                new GetEntityResponse<UploadLimitForUserForCurrentMonth>(uploadLimitForUser, null).Result()
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
            this.logger.LogError($"Failed to get user's monthly upload limit. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get user's monthly upload limit"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


    /// <summary>
    /// Get Monthly Withdrawal Limit for User
    /// </summary>
    /// <response code="200">Withdrawal Limit returned successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpGet("users/limits/withdrawal")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<WithdrawalLimitForUserForCurrentMonth>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetWithdrawalLimitForUser()
    {
        try
        {
            logger.LogInformation("Getting user's withdrawal limit");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var creatorInfo = await _creatorService.GetCreatorDetails(currentUser.Id);

            var withdrawalLimit = PermissionsHelper.GetAmountYouCanWithdrawPerMonth(creatorInfo.CreatorSubscription.PackageType);
            var yourWithdrawals = await _permissionService.GetMonthlyWithdrawalLimit(creatorInfo);
            var withdrawalLimitForUser = new WithdrawalLimitForUserForCurrentMonth
            {
                Withdrawal = yourWithdrawals,
                Limit = withdrawalLimit
            };

            return new ObjectResult(
                new GetEntityResponse<WithdrawalLimitForUserForCurrentMonth>(withdrawalLimitForUser, null).Result()
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
            this.logger.LogError($"Failed to get user's monthly withdrawal limit. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get user's monthly withdrawal limit"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


}

