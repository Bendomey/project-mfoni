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
    private readonly UserTransformer _userTransformer;
    private readonly CreatorApplicationService _creatorApplicationService;
    private readonly CreatorApplicationTransformer _creatorApplicationTransformer;
    private readonly CreatorTransformer _creatorTransformer;

    public UserController(
        ILogger<UserController> logger,
        UserService userService,
        CreatorApplicationService creatorApplicationService,
        CreatorApplicationTransformer creatorApplicationTransformer,
        CreatorTransformer creatorTransformer,
        UserTransformer userTransformer
    )
    {
        this.logger = logger;
        this.userService = userService;
        this._creatorApplicationService = creatorApplicationService;
        this._creatorApplicationTransformer = creatorApplicationTransformer;
        this._creatorTransformer = creatorTransformer;
        this._userTransformer = userTransformer;
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
            new GetEntityResponse<OutputCreatorApplication>(_creatorApplicationTransformer.Transform(creatorApplication), null).Result()
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
            new GetEntityResponse<OutputCreatorApplication>(_creatorApplicationTransformer.Transform(creatorApplication), null).Result()
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
            new GetEntityResponse<OutputCreatorApplication>(_creatorApplicationTransformer.Transform(creatorApplication), null).Result()
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
            new GetEntityResponse<OutputCreatorApplication>(_creatorApplicationTransformer.Transform(creatorApplication), null).Result()
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
            new GetEntityResponse<OutputCreator>(_creatorTransformer.Transform(creator), null).Result()
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
            new GetEntityResponse<OutputCreatorApplication>(_creatorApplicationTransformer.Transform(creatorApplication), null).Result()
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
            var queryFilter = HttpLib.GenerateFilterQuery<User>(page, pageSize, sort, sortBy);
            var input = new GetUsersInput
            {
                Role = role,
                Status = status,
                Provider = provider,
                Search = search
            };
            var users = await userService.GetUsers(queryFilter, input);
            long count = await userService.CountUsers(input);

            var outUser = users.ConvertAll<OutputUser>(
                new Converter<User, OutputUser>(user => _userTransformer.Transform(user))
            );
            var response = HttpLib.GeneratePagination<OutputUser, User>(
                outUser,
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
                sortBy
            );
            var creatorApplications = await _creatorApplicationService.GetCreatorApplications(
                queryFilter,
                status
            );

            long count = await _creatorApplicationService.CountCreatorApplications(status);

            var outCreatorApplications = creatorApplications.ConvertAll<OutputCreatorApplication>(
                new Converter<CreatorApplication, OutputCreatorApplication>(creatorApplication =>
                    _creatorApplicationTransformer.Transform(creatorApplication)
                )
            );
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

}

