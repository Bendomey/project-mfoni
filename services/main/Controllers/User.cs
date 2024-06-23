using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using main.DTOs;
using main.Domains;
using main.Middlewares;
using System.Security.Claims;
using System.Net;

namespace main.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> logger;
    private readonly UserService userService;

    public UserController(
        ILogger<UserController> logger,
        UserService userService)
    {
        this.logger = logger;
        this.userService = userService;
    }

    [Authorize]
    [HttpPatch("phone")]
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
    [HttpPatch("phone/verify")]
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

    [HttpPost("identity/verify")]
    public async Task<IActionResult> VerifyIdentity([FromBody] IdentityVerificationInput input)
    {
        try
        {
            logger.LogInformation($"verify user identity {input}");
            await userService.VerifyIdentity(input);
            return new ObjectResult(new GetEntityResponse<bool?>(true, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            // sentry error
            logger.LogError($"Verify Identity exception: {e}");
            return new StatusCodeResult(500);
        }
    }

}

