
using System.Net;
using main.Domains;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using main.Transformations;
using main.Middlewares;
using System.Security.Claims;

namespace main.Controllers;

[ApiController]
[Route("api/v1/admins")]
public class AdminController : ControllerBase
{
    private readonly ILogger<WaitlistController> logger;
    private readonly AdminAuthService _adminAuthService;
    private readonly AdminService _adminService;
    private readonly AdminTransformer _adminTransformer;

    public AdminController(ILogger<WaitlistController> logger, AdminAuthService adminAuthService, AdminService adminService, AdminTransformer adminTransformer)
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
            var currentAdmin = CurrentAdmin.GetCurrentAdmin(HttpContext.User.Identity as ClaimsIdentity);
            var admin = await _adminService.Create(new Domains.CreateAdminInput
            {
                Name = input.Name,
                Email = input.Email,
                CreatedBy = currentAdmin.Id,
            });

            return new ObjectResult(
                new GetEntityResponse<OutputAdmin>(_adminTransformer.Transform(admin), null).Result()
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

            return new ObjectResult(new GetEntityResponse<OutputAdmin>(null, e.Message).Result()) { StatusCode = (int)statusCode };
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

            return new ObjectResult(new GetEntityResponse<OutputAdmin>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this.logger.LogError($"Failed to login admin. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }
}