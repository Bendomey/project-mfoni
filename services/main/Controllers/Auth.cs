using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Security.Claims;
using main.Domains;
using main.DTOs;
using main.Middlewares;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;

namespace main.Controllers;

[ApiController]
[Route("api/v1")]
public class AuthController : ControllerBase
{
    private readonly ILogger<MediaController> _logger;
    private readonly UserAuth _authService;
    private readonly UserService _userService;
    private readonly UserTransformer _userTransformer;

    public AuthController(
        ILogger<MediaController> logger,
        UserAuth authService,
        UserService userService,
        UserTransformer userTransformer
    )
    {
        _logger = logger;
        _authService = authService;
        _userService = userService;
        _userTransformer = userTransformer;
    }

    [HttpPost("auth")]
    [ProducesResponseType(
        typeof(OutputResponse<DTOs.AuthenticateResponse>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public IActionResult Authenticate([FromBody] [Required] AuthenticateInput input)
    {
        try
        {
            _logger.LogInformation("Authenticate user input: " + input);
            var res = _authService.Authenticate(input);

            var output = new DTOs.AuthenticateResponse
            {
                Token = res.Token,
                User = _userTransformer.Transform(res.User)
            };
            return new ObjectResult(
                new GetEntityResponse<DTOs.AuthenticateResponse>(output, null).Result()
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

            return new ObjectResult(
                new GetEntityResponse<DTOs.AuthenticateResponse>(null, e.Message).Result()
            )
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to authenticate. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpPost("auth/setup")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public IActionResult SetupAccount([FromBody] [Required] SetupAccountInput input)
    {
        try
        {
            _logger.LogInformation("Setting up account." + input);
            var currentUser = CurrentUser.GetCurrentUser(
                HttpContext.User.Identity as ClaimsIdentity
            );
            var res = _userService.SetupAccount(input, currentUser);

            return new ObjectResult(new GetEntityResponse<bool?>(true, null).Result())
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

            return new ObjectResult(new GetEntityResponse<bool?>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to setup account. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [Authorize]
    [HttpGet("auth/me")]
    [ProducesResponseType(typeof(OutputResponse<OutputUser>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public IActionResult Me()
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(
                HttpContext.User.Identity as ClaimsIdentity
            );
            var res = _authService.Me(currentUser);

            return new ObjectResult(
                new GetEntityResponse<OutputUser>(_userTransformer.Transform(res!), null).Result()
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

            return new ObjectResult(new GetEntityResponse<OutputUser>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get me. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }
}
