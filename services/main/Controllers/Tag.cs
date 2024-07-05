using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Net;
using main.Middlewares;
using System.Security.Claims;
using Microsoft.OpenApi.Any;

namespace main.Controllers;

[ApiController]
[Route("api/v1/tags")]
public class TagsController : ControllerBase
{
    private readonly ILogger<MediaController> _logger;
    private readonly SaveTags _saveTagsService;
    private readonly SearchTag _searchTagsService;

    public TagsController(ILogger<MediaController> logger, SaveTags saveTagsService, SearchTag searchTagService)
    {
        _logger = logger;
        _saveTagsService = saveTagsService;
        _searchTagsService = searchTagService;
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

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int? page, [FromQuery] int? pageSize, [FromQuery] string? sort, [FromQuery] string sortBy = "created_at")
    {
        try
        {
            _logger.LogInformation("Getting all tags");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Tag>(page, pageSize, sort, sortBy);
            var tags = await _searchTagsService.GetAll(queryFilter, search);
            var tagsCount = await _searchTagsService.Count(search);

            var response = HttpLib.GeneratePagination(tags, tagsCount, queryFilter);
            return new ObjectResult(new GetEntityResponse<EntityWithPagination<Models.Tag>>(response, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            return new StatusCodeResult(500);
        }
    }

}
