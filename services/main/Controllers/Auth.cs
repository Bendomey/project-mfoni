using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using main.Middlewares;

namespace main.Controllers;

[ApiController]
[Route("api/v1")]
public class AuthController : ControllerBase
{
    private readonly ILogger<MediaController> _logger;
    private readonly Auth _authService;

    public AuthController(ILogger<MediaController> logger, Auth authService)
    {
        _logger = logger;
        _authService = authService;
    }

    [HttpPost("auth")]
    public OutputResponse<AuthenticateResponse> Authenticate([FromBody] AuthenticateInput input)
    {
        try
        {
            _logger.LogInformation("Authenticate user input: " + input);
            var res = _authService.Authenticate(input);

            if (res is not null)
            {
                return new GetEntityResponse<AuthenticateResponse>(res, null).Result();
            }
            else
            {
                // This should never happen.
                return new GetEntityResponse<AuthenticateResponse>(null, "UserNotFound").Result();
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error authenticating user");
            return new GetEntityResponse<AuthenticateResponse>(null, e.Message).Result();
        }
    }

    [Authorize]
    [HttpPost("auth/setup")]
    public OutputResponse<bool?> SetupAccount([FromBody] SetupAccountInput input)
    {
        _logger.LogInformation("Setting up account." + input);
        var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
        if (currentUser is not null)
        {
            try
            {
                var res = _authService.SetupAccount(input, currentUser);

                return new GetEntityResponse<bool?>(true, null).Result();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error setting up account");
                return new GetEntityResponse<bool?>(null, e.Message).Result();
            }

        }

        return new GetEntityResponse<bool?>(null, "UserNotFound").Result();
    }

    [Authorize]
    [HttpGet("auth/me")]
    public OutputResponse<Models.User> Me(){
        var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
        if (currentUser is not null)
        {
            try
            {
                var res = _authService.Me(currentUser);

                return new GetEntityResponse<Models.User>(res, null).Result();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error fetching current user");
                return new GetEntityResponse<Models.User>(null, e.Message).Result();
            }
        }

        return new GetEntityResponse<Models.User>(null, "UserNotFound").Result();
    }

}
