using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using main.DTOs;
using main.Domains;
using main.Middlewares;
using System.Security.Claims;
using System.Net;
using main.Transformations;
using Microsoft.OpenApi.Any;
using main.Models;
using main.Lib;

namespace main.Controllers;

[ApiController]
[Route("api/v1/creators")]
public class CreatorController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly CreatorService _creatorService;
    private readonly CreatorTransformer _creatorTransformer;

    public CreatorController(
        ILogger<UserController> logger,
        CreatorService creatorService,
        CreatorTransformer creatorTransformer
    )
    {
        _logger = logger;
        _creatorService = creatorService;
        _creatorTransformer = creatorTransformer;
    }

    /// <summary>
    /// Get creator by username
    /// </summary>
    /// <param name="username">username of creator</param>
    /// <response code="200">Creator Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{username}")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputCreatorEnhanced>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetCreatorByUsername(
        string username
    )
    {
        try
        {
            _logger.LogInformation("Get creator by username");
            var creator = await _creatorService.GetCreatorByUsername(username);

            if (creator.Status != CreatorStatus.ACTIVE)
            {
                throw new HttpRequestException("CreatorNotActive");
            }

            if (creator.WebsiteDisabledAt != null)
            {
                throw new HttpRequestException("CreatorWebsiteDisabled");
            }

            var creatorTransformed = await _creatorTransformer.TransformEnhancedCreator(creator);

            return new ObjectResult(
                new GetEntityResponse<OutputCreatorEnhanced>(creatorTransformed, null).Result()
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
            _logger.LogError($"An error occured getting creator {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get creator by username"},
                    {"username", username},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get related creators
    /// </summary>
    /// <param name="username">username of creator</param>
    /// /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Related Creators Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{username}/related")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputBasicCreator>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetRelatedCreators(
        string username,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            _logger.LogInformation("Get related creators to username");
            var queryFilter = HttpLib.GenerateFilterQuery<Creator>(
               page,
               pageSize,
               sort,
               sortBy,
               ""
           );

            var creators = await _creatorService.GetRelatedCreators(username);
            var creatorsCount = await _creatorService.GetRelatedCreatorsCount(username);

            var creatorsTransformed = new List<OutputBasicCreator>();
            foreach (var creator in creators)
            {
                var creatorTransformed = await _creatorTransformer.TransformBasicCreator(creator);
                creatorsTransformed.Add(creatorTransformed);
            }

            var response = HttpLib.GeneratePagination(
                creatorsTransformed,
                creatorsCount,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputBasicCreator>>(
                    response,
                    null
                ).Result()
            );
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
            _logger.LogError($"An error occured getting related creators {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get related creators to current creator"},
                    {"username", username},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get creators
    /// </summary>
    /// <param name="search">search creators</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Creators Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet()]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputCreatorEnhanced>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetCreators(
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            _logger.LogInformation("Get creators");
            var queryFilter = HttpLib.GenerateFilterQuery<Creator>(
               page,
               pageSize,
               sort,
               sortBy,
               ""
           );

            var creators = await _creatorService.GetCreators(queryFilter, new GetCreatorsInput
            {
                Query = search
            });

            var creatorsCount = await _creatorService.GetCreatorsCount(new GetCreatorsInput
            {
                Query = search
            });

            var creatorsTransformed = new List<OutputCreatorEnhanced>();
            foreach (var creator in creators)
            {
                var creatorTransformed = await _creatorTransformer.TransformEnhancedCreator(creator);
                creatorsTransformed.Add(creatorTransformed);
            }

            var response = HttpLib.GeneratePagination(
                creatorsTransformed,
                creatorsCount,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCreatorEnhanced>>(
                    response,
                    null
                ).Result()
            );
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
            _logger.LogError($"An error occured getting related creators {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get creators"},
                    {"search", StringLib.SafeString(search)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Update creator basic details
    /// </summary>
    /// <response code="200">Creator Updated Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPatch]
    [ProducesResponseType(typeof(OutputResponse<Models.Creator>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateCreatorBasicDetails([FromBody] Domains.UpdateCreatorBasicDetails input)
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);

            _logger.LogInformation("Updating creator: " + input);
            var creator = await _creatorService.GetCreatorByUserId(currentUser.Id);
            var creatorUpdates = await _creatorService.UpdateCreatorBasicInfo(new Domains.UpdateCreatorBasicDetails
            {
                CreatorId = creator.Id,
                About = input.About,
                Address = input.Address,
                Interests = input.Interests,
                SocialMedia = input.SocialMedia
            });

            return new ObjectResult(new GetEntityResponse<Models.Creator>(creatorUpdates, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.ReportContentCase>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to update creator. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Update creator"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(input.ToString())},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }


    /// <summary>
    /// Enable creator website
    /// </summary>
    /// <response code="200">Creator Updated Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPatch("website/enable")]
    [ProducesResponseType(typeof(OutputResponse<Models.Creator>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> EnableCreatorWebsite()
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);

            var creator = await _creatorService.GetCreatorByUserId(currentUser.Id);
            _logger.LogInformation("Enabling creator website: " + creator.Id);
            if (creator.WebsiteDisabledAt is null)
            {
                throw new HttpRequestException("CreatorWebsiteAlreadyEnabled");
            }

            var creatorUpdates = await _creatorService.ToggleWebsiteViewing(currentUser.Id);

            return new ObjectResult(new GetEntityResponse<Models.Creator>(creatorUpdates, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.ReportContentCase>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to enable creator website. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "enable creator website"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Disable creator website
    /// </summary>
    /// <response code="200">Creator Updated Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPatch("website/disable")]
    [ProducesResponseType(typeof(OutputResponse<Models.Creator>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DisableCreatorWebsite()
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);

            var creator = await _creatorService.GetCreatorByUserId(currentUser.Id);
            _logger.LogInformation("Disabling creator website: " + creator.Id);
            if (creator.WebsiteDisabledAt is not null)
            {
                throw new HttpRequestException("CreatorWebsiteAlreadyDisabled");
            }

            var creatorUpdates = await _creatorService.ToggleWebsiteViewing(currentUser.Id);

            return new ObjectResult(new GetEntityResponse<Models.Creator>(creatorUpdates, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.ReportContentCase>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to disable creator website. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "disable creator website"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

}

