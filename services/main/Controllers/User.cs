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
        var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
        if (currentUser == null)
        {
            throw new Exception("UserNotFound");
        }

        try
        {
            var savedPhoneNumber = await userService.SavePhoneNumber(userPhoneNumber.phoneNumber, currentUser.Id);
            return new GetEntityResponse<bool?>(savedPhoneNumber, null).Result();
        }
        catch (Exception e)
        {
            logger.LogError($"{e.Message}");
            return new GetEntityResponse<bool?>(null, e.Message).Result();
        }
    }
}

