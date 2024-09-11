using System.Net;
using System.Security.Claims;
using main.Domains;
using main.DTOs;
using main.Middlewares;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace main.Controllers;

[ApiController]
[Route("api/v1/admins")]
public class AdminController : ControllerBase
{
    private readonly ILogger<WaitlistController> logger;
    private readonly AdminAuthService _adminAuthService;
    private readonly AdminService _adminService;
    private readonly AdminTransformer _adminTransformer;

    public AdminController(
        ILogger<WaitlistController> logger,
        AdminAuthService adminAuthService,
        AdminService adminService,
        AdminTransformer adminTransformer
    )
    {
        this.logger = logger;
        this._adminAuthService = adminAuthService;
        this._adminService = adminService;
        this._adminTransformer = adminTransformer;
    }

    [Authorize(Policy = "Admin")]
    [HttpPost]
    public async Task<ActionResult> AddAdmin([FromBody] DTOs.CreateAdminInput input)
    {
        try
        {
            var currentAdmin = CurrentAdmin.GetCurrentAdmin(
                HttpContext.User.Identity as ClaimsIdentity
            );
            var admin = await _adminService.Create(
                new Domains.CreateAdminInput
                {
                    Name = input.Name,
                    Email = input.Email,
                    CreatedBy = currentAdmin.Id,
                }
            );

            return new ObjectResult(
                new GetEntityResponse<OutputAdmin>(
                    _adminTransformer.Transform(admin),
                    null
                ).Result()
            )
            {
                StatusCode = StatusCodes.Status201Created
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<OutputAdmin>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this.logger.LogError($"Failed to save admin entry into database. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [HttpPost("login")]
    public ActionResult Login([FromBody] LoginAdminInput input)
    {
        try
        {
            var admin = _adminAuthService.Authenticate(input);

            var output = new DTOs.AdminAuthenticateResponse
            {
                Token = admin.Token,
                Admin = _adminTransformer.Transform(admin.Admin)
            };

            return new ObjectResult(
                new GetEntityResponse<DTOs.AdminAuthenticateResponse>(output, null).Result()
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

            return new ObjectResult(new GetEntityResponse<OutputAdmin>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this.logger.LogError($"Failed to login admin. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    ///<summary>Updates the admin password</summary>
    /// <response code="200">Password updated successfully</response>
    /// <response code="400">Password failed to update due to some mismatch</response>
    /// <response code="404">Admin of id not found</response>
    /// <response code="500">An unknown error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpPatch]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiEntityResponse<bool>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiErrorResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiErrorResponse))]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordInput input)
    {
        try
        {
            this.logger.LogInformation("Updating password");
            var currentAdmin = CurrentAdmin.GetCurrentAdmin(
                HttpContext.User.Identity as ClaimsIdentity
            );
            var admin = await _adminService.UpdatePassword(currentAdmin.Id, input);
            var transformed = _adminTransformer.Transform(admin);

            return new ObjectResult(new GetEntityResponse<bool>(true, null).Result())
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = e.StatusCode ?? HttpStatusCode.BadRequest;

            return new ObjectResult(new GetEntityResponse<OutputAdmin>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this.logger.LogError($"Failed to update admin password. Exception: {e}");
            return new StatusCodeResult((int)HttpStatusCode.InternalServerError);
        }
    }
}
