using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Sockets;
using System.Security.Claims;
using main.Domains;
using main.DTOs;
using main.Lib;
using main.Middlewares;
using main.Models;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;

namespace main.Controllers;

[ApiController]
[Route("api/v1/admins")]
public class AdminController : ControllerBase
{
    private readonly ILogger<WaitlistController> logger;
    private readonly AdminAuthService _adminAuthService;
    private readonly AdminService _adminService;

    private readonly SearchAdmin _searchAdminService;
    private readonly AdminTransformer _adminTransformer;
    private readonly UserTransformer _userTransformer;
    private readonly CreatorApplicationTransformer _creatorApplicationTransformer;

    public AdminController(
        ILogger<WaitlistController> logger,
        AdminAuthService adminAuthService,
        AdminService adminService,
        SearchAdmin searchAdminService,
        AdminTransformer adminTransformer,
        UserTransformer userTransformer,
        CreatorApplicationTransformer creatorApplicationTransformer
    )
    {
        this.logger = logger;
        this._adminAuthService = adminAuthService;
        this._adminService = adminService;
        this._searchAdminService = searchAdminService;
        this._adminTransformer = adminTransformer;
        this._userTransformer = userTransformer;
        this._creatorApplicationTransformer = creatorApplicationTransformer;
    }

    [Authorize(Policy = "Admin")]
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<OutputAdmin>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> AddAdmin([FromBody] [Required] DTOs.CreateAdminInput input)
    {
        try
        {
            var currentAdmin = CurrentAdmin.GetCurrentAdmin(
                HttpContext.User.Identity as ClaimsIdentity
            );
            var admin = await _adminService.Create(
                new Domains.CreateAdminInput { Name = input.Name, Email = input.Email, }
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
    [ProducesResponseType(
        typeof(OutputResponse<DTOs.AdminAuthenticateResponse>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public ActionResult Login([FromBody] [Required] LoginAdminInput input)
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
    public async Task<IActionResult> UpdatePassword([FromBody] [Required] UpdatePasswordInput input)
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

    /// <summary>
    /// To retrieve all admins in the system
    /// </summary>
    /// <param name="search">Search by name</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Admins retrieved successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpGet]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<Admin>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all admins");
            var queryFilter = HttpLib.GenerateFilterQuery<Admin>(page, pageSize, sort, sortBy);
            var admins = await _searchAdminService.GetAdmins(queryFilter, search);

            long count = await _searchAdminService.CountAdmins(queryFilter, search);

            var outAdmin = admins.ConvertAll<OutputAdmin>(
                new Converter<Admin, OutputAdmin>(admin => _adminTransformer.Transform(admin))
            );
            var response = HttpLib.GeneratePagination<OutputAdmin, Admin>(
                outAdmin,
                count,
                queryFilter
            );
            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputAdmin>>(response, null).Result()
            )
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = e.StatusCode ?? HttpStatusCode.BadRequest;

            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            logger.LogError($"Failed to get admins. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all users on the platform
    /// </summary>
    /// <param name="status">Can be `ACTIVE` or `SUSPENDED`</param>
    /// <param name="role">Can be `CLIENT` or `CREATOR`</param>
    /// <param name="provider">Can be `FACEBOOK` or `TWITTER` or `GOOGLE` </param>
    /// <param name="search">Search by name</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Users Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpGet("users")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputUser>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetUsersByAdmin(
        [FromQuery] string? status,
        [FromQuery] string? role,
        [FromQuery] string? provider,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all users by admins");
            var queryFilter = HttpLib.GenerateFilterQuery<User>(page, pageSize, sort, sortBy);
            var users = await _searchAdminService.GetUsers(
                queryFilter,
                status,
                role,
                provider,
                search
            );
            long count = await _searchAdminService.CountUsers(
                queryFilter,
                status,
                role,
                provider,
                search
            );

            var outUser = users.ConvertAll<OutputUser>(
                new Converter<User, OutputUser>(user => _userTransformer.Transform(user))
            );
            var response = HttpLib.GeneratePagination<OutputUser, User>(
                outUser,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputUser>>(response, null).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = e.StatusCode ?? HttpStatusCode.BadRequest;
            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            logger.LogError($"An error occured {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all creator applications on the platform
    /// </summary>
    /// <param name="status">Can be `PENDING`, `SUBMITTED`, `REJECTED` or `APPROVED` </param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Creator Applications Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpGet("creator-applications")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputCreatorApplication>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetCreatorsByAdmin(
        [FromQuery] string? status,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            logger.LogInformation("Getting all creator applications by admin");
            var queryFilter = HttpLib.GenerateFilterQuery<CreatorApplication>(
                page,
                pageSize,
                sort,
                sortBy
            );
            var creatorApplications = await _searchAdminService.GetCreators(queryFilter, status);

            long count = await _searchAdminService.CountCreators(queryFilter, status);

            var outCreatorApplications = creatorApplications.ConvertAll<OutputCreatorApplication>(
                new Converter<CreatorApplication, OutputCreatorApplication>(creatorApplication =>
                    _creatorApplicationTransformer.Transform(creatorApplication)
                )
            );
            var response = HttpLib.GeneratePagination<OutputCreatorApplication, CreatorApplication>(
                outCreatorApplications,
                count,
                queryFilter
            );
            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCreatorApplication>>(
                    response,
                    null
                ).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
            };
        }
        catch (HttpRequestException e)
        {
            var statusCode = e.StatusCode ?? HttpStatusCode.BadRequest;
            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            logger.LogError($"An error occured {e}");
            return new StatusCodeResult(500);
        }
    }
}
