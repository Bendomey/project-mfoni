using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using main.Middlewares;
using System.Net;

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
    public IActionResult Authenticate([FromBody] AuthenticateInput input)
    {
        try
        {
            _logger.LogInformation("Authenticate user input: " + input);
            var res = _authService.Authenticate(input);
            return new ObjectResult(new GetEntityResponse<AuthenticateResponse>(res, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<AuthenticateResponse>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to authenticate. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPost("auth/setup")]
    public IActionResult SetupAccount([FromBody] SetupAccountInput input)
    {
        try
        {
            _logger.LogInformation("Setting up account." + input);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var res = _authService.SetupAccount(input, currentUser);

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
            this._logger.LogError($"Failed to setup account. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpGet("auth/me")]
    public IActionResult Me()
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var res = _authService.Me(currentUser);

            return new ObjectResult(new GetEntityResponse<Models.User>(res, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.User>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get me. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

}
