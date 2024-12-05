using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Net;
using main.Middlewares;
using System.Security.Claims;
using Microsoft.OpenApi.Any;
using main.Lib;
using main.Transformations;

namespace main.Controllers;

[ApiController]
[Route("api/v1/tags")]
public class TagsController : ControllerBase
{
    private readonly ILogger<TagsController> _logger;
    private readonly SaveTagsService _saveTagsService;
    private readonly SearchTagService _searchTagsService;
    private readonly TagTransformer _tagTransformer;

    public TagsController(ILogger<TagsController> logger, SaveTagsService saveTagsService, SearchTagService searchTagService, TagTransformer tagTransformer)
    {
        _logger = logger;
        _saveTagsService = saveTagsService;
        _searchTagsService = searchTagService;
        _tagTransformer = tagTransformer;
    }

    [Authorize]
    [HttpPost]
    public IActionResult Create([FromBody] CreateTagInput input)
    {
        try
        {
            _logger.LogInformation("Saving tag: " + input);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var tag = _saveTagsService.Create(input, currentUser);

            return new ObjectResult(new GetEntityResponse<Models.Tag>(tag, null).Result()) { StatusCode = StatusCodes.Status201Created };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.Tag>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to save tag. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        try
        {
            _logger.LogInformation("Getting tag: " + id);
            var tag = await _searchTagsService.Get(id);

            if (tag == null)
            {
                throw new HttpRequestException("TagNotFound");
            }

            return new ObjectResult(new GetEntityResponse<Models.Tag>(tag, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.Tag>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get tag. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all tags on the platform
    /// </summary>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="search">Search by name</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Users Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputTag>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? populate,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            _logger.LogInformation("Getting all tags");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Tag>(page, pageSize, sort, sortBy, populate);
            var tags = await _searchTagsService.GetAll(queryFilter, search);
            var tagsCount = await _searchTagsService.Count(search);

            var outputTags = new List<OutputTag>();
            foreach (var tag in tags)
            {
                outputTags.Add(await _tagTransformer.Transform(tag, populate: queryFilter.Populate));
            }
            var response = HttpLib.GeneratePagination(outputTags, tagsCount, queryFilter);
            return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputTag>>(response, null).Result()) { StatusCode = (int)HttpStatusCode.OK };
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
            this._logger.LogError($"Failed to get tags. Exception: {e}");
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

}
