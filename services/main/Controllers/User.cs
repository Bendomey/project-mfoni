using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using main.DTOs;
using main.Domains;
using main.Middlewares;
using System.Security.Claims;
using System.Net;
using main.Transformations;
using Microsoft.OpenApi.Any;

namespace main.Controllers;

[ApiController]
[Route("api/v1")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> logger;
    private readonly UserService userService;
    private readonly CreatorApplicationService _creatorApplicationService;
    private readonly CreatorApplicationTransformer _creatorApplicationTransformer;
    private readonly CreatorTransformer _creatorTransformer;

    public UserController(
        ILogger<UserController> logger,
        UserService userService,
        CreatorApplicationService creatorApplicationService,
        CreatorApplicationTransformer creatorApplicationTransformer,
        CreatorTransformer creatorTransformer
    )
    {
        this.logger = logger;
        this.userService = userService;
        this._creatorApplicationService = creatorApplicationService;
        this._creatorApplicationTransformer = creatorApplicationTransformer;
        this._creatorTransformer = creatorTransformer;
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
    [HttpPost("creator-applications/{id}/submit")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreatorApplication>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitCreatorApplication([FromBody] SubmitCreatorApplicationInput input, string id)
    {
        try
        {
            logger.LogInformation($"verify user identity {input}");
            var creatorApplication = await _creatorApplicationService.SubmitCreatorApplication(input, id);
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
    [HttpPost("creator-applications/{id}/approve")]
    [ProducesResponseType(typeof(OutputResponse<OutputCreator>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitCreatorApplication(string id)
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
    [HttpPost("creator-applications/{id}/reject")]
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

}

