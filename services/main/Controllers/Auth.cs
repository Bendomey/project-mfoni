using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;

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

}
