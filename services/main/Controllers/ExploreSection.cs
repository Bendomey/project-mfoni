
using System.Net;
using System.Security.Claims;
using main.Domains;
using main.DTOs;
using main.Lib;
using main.Middlewares;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;

namespace main.Controllers;

[ApiController]
[Route("api/v1/explore")]
public class ExploreSectionController : ControllerBase
{
    private readonly ILogger<ExploreSectionController> _logger;
    private readonly ExploreSectionService _exploreSectionService;
    private readonly ExploreSectionTransformer _exploreSectionTransformer;

    public ExploreSectionController(
        ILogger<ExploreSectionController> logger,
        ExploreSectionService exploreSectionService,
        ExploreSectionTransformer exploreSectionTransformer
    )
    {
        _logger = logger;
        _exploreSectionService = exploreSectionService;
        _exploreSectionTransformer = exploreSectionTransformer;
    }

    [Authorize(Policy = "Admin")]
    [HttpPost()]
    public async Task<ActionResult> SaveSection(
        [FromBody] DTOs.CreateExploreSectionInput input
    )
    {
        try
        {
            var currentAdmin = CurrentAdmin.GetCurrentAdmin(
                HttpContext.User.Identity as ClaimsIdentity
            );
            var exploreSection = await _exploreSectionService.Create(
                new Domains.CreateExploreSection
                {
                    Title = input.Title,
                    Endpoint = input.Endpoint,
                    Type = input.Type,
                    EnsureAuth = input.EnsureAuth,
                    SeeMorePathname = input.SeeMorePathname,
                    CreatedById = currentAdmin.Id,
                    Visibility = input.Visibility
                }
            );

            return new ObjectResult(
                new GetEntityResponse<OutputExploreSection>(
                    _exploreSectionTransformer.Transform(exploreSection),
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

            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            _logger.LogError($"Failed to save explore section entry into database. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Create Explore Section"},
                    {"userId", CurrentAdmin.GetCurrentAdmin(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(input.ToString())},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// To retrieve explore sections
    /// </summary>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Explore Sections retrieved successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputExploreSection>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            _logger.LogInformation("Getting explore sections");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.ExploreSection>(page, pageSize, sort, sortBy, populate);
            var sections = await _exploreSectionService.GetSections(queryFilter);

            long count = await _exploreSectionService.CountSections();

            var outSectionTransformed = sections.Select(section => _exploreSectionTransformer.Transform(section, populate: queryFilter.Populate));
            var outSection = outSectionTransformed.ToList();

            var response = HttpLib.GeneratePagination(
                outSection,
                count,
                queryFilter
            );
            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputExploreSection>>(response, null).Result()
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

            return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            _logger.LogError($"Failed to fetch explore section entry. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get Explore Sections"},
                    {"populate", populate},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(500);
        }
    }

}