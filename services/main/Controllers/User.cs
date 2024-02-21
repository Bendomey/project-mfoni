using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using main.DTOs;
using main.Domains;
using main.Middlewares;
using System.Security.Claims;

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
    public async Task<OutputResponse<bool?>> SavePhoneNumber([FromBody] PhoneNumberInput userPhoneNumber)
    {
        logger.LogInformation($"saving user phone number {userPhoneNumber}");

        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            if (currentUser == null)
            {
                throw new HttpRequestException("UserNotFound");
            }

            var savedPhoneNumber = await userService.SavePhoneNumber(userPhoneNumber.phoneNumber, currentUser.Id);
            return new GetEntityResponse<bool?>(savedPhoneNumber, null).Result();
        }
        catch (HttpRequestException e)
        {
            return new GetEntityResponse<bool?>(null, e.Message).Result();
        }

        catch (Exception e)
        {
            logger.LogError($"{e.Message}");
            return new GetEntityResponse<bool?>(null, e.Message).Result();
        }
    }

    [Authorize]
    [HttpPatch("phone/verify")]
    public async Task<OutputResponse<bool?>> VerifyPhoneNumber([FromBody] VerificationCodeInput code)
    {
        logger.LogInformation("verifying user phone number");


        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            if (currentUser == null)
            {
                throw new HttpRequestException("UserNotFound");
            }

            var verifyPhoneNumber = await userService.VerifyPhoneNumber(code.verificationCode, currentUser.Id);
            return new GetEntityResponse<bool?>(verifyPhoneNumber, null).Result();
        }
        catch (HttpRequestException e)
        {
            return new GetEntityResponse<bool?>(null, e.Message).Result();
        }
        catch (Exception e)
        {
            logger.LogError($"{e.Message}");
            return new GetEntityResponse<bool?>(null, e.Message).Result();
        }
    }

    // [HttpPost("identity/verify")]
    // public async Task<OutputResponse<bool?>> VerifyIdentity([FromBody] IdentityVerificationInput input)
    // {
    //     logger.LogInformation($"verify user identity {input}");
    //     try
    //     {
    //         await userService.VerifyIdentity(input);
    //         return new GetEntityResponse<bool?>(true, null).Result();
    //     }

    //     catch (HttpRequestException e)
    //     {
    //         // sentry error
    //         logger.LogError($"{e.Message}");
    //         return new GetEntityResponse<bool?>(null, e.Message).Result();
    //     }

    //     catch (Exception e)
    //     {
    //         // sentry error
    //         logger.LogError($"{e.Message}");
    //         return new GetEntityResponse<bool?>(null, e.Message).Result();
    //     }
    // }

    [HttpPost("identity/verify")]
    public OutputResponse<bool?> VerifyIdentity([FromBody] dynamic input)
    {
        logger.LogInformation($"verify user identity {input}");
        try
        {
            return new GetEntityResponse<bool?>(true, null).Result();
        }

        catch (HttpRequestException e)
        {
            // sentry error
            logger.LogError($"{e.Message}");
            return new GetEntityResponse<bool?>(null, e.Message).Result();
        }

        catch (Exception e)
        {
            // sentry error
            logger.LogError($"{e.Message}");
            return new GetEntityResponse<bool?>(null, e.Message).Result();
        }
    }

}

