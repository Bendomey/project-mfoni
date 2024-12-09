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
    private readonly ContentTransformer _contentTransformer;

    public TagsController(ILogger<TagsController> logger, SaveTagsService saveTagsService, SearchTagService searchTagService, TagTransformer tagTransformer,
        ContentTransformer contentTransformer
    )
    {
        _logger = logger;
        _saveTagsService = saveTagsService;
        _searchTagsService = searchTagService;
        _tagTransformer = tagTransformer;
        _contentTransformer = contentTransformer;
    }

    /// <summary>
    /// Creates a tag
    /// </summary>
    /// <response code="200">Tag Created Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<Models.Tag>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Create Tag"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(input.ToString())},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get tag by id
    /// </summary>
    /// <param name="id">id of tag</param>
    /// <response code="200">Tag Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputTag>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
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

            var outputTag = await _tagTransformer.Transform(tag!);
            return new ObjectResult(new GetEntityResponse<OutputTag>(outputTag, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get Tag by id"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get tag by slug
    /// </summary>
    /// <param name="slug">slug of tag</param>
    /// <response code="200">Tag Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{slug}/slug")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputTag>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        try
        {
            _logger.LogInformation("Getting tag: " + slug);
            var tag = _searchTagsService.GetBySlug(slug);

            var outputTag = await _tagTransformer.Transform(tag!);
            return new ObjectResult(new GetEntityResponse<OutputTag>(outputTag, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get Tag by slug"},
                    {"slug", slug}
               });
                SentrySdk.CaptureException(e);
            });
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
    /// <response code="200">Tags Retrieved Successfully</response>
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
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
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
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get All Tags"},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"populate", populate},
                    {"search", StringLib.SafeString(search)}
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Get contents in a tag by slug
    /// </summary>
    /// <param name="license">Can be `ALL` or `FREE` or `PREMIUM`</param>
    /// <param name="orientation">Can be `ALL` or `LANDSCAPE` or `PORTRAIT` or `SQUARE`</param>
    /// <param name="slug">slug of tag</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Retrieved contents from a tag Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{slug}/contents/slug")]
    [ProducesResponseType(typeof(OutputResponse<List<OutputContent>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetContentsFromTagBySlug(
        string slug,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string license = "ALL",
        [FromQuery] string orientation = "ALL"
    )
    {
        // Don't break the request if user is not authenticated
        string? userId = null;
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            userId = currentUser.Id;
        }
        catch (Exception) { }

        try
        {
            _logger.LogInformation("Getting tag contents");
            var tag = _searchTagsService.GetBySlug(slug);

            var queryFilter = HttpLib.GenerateFilterQuery<Models.Content>(page, pageSize, sort, sortBy, populate);

            var input = new Domains.GetContentsForTagInput
            {
                TagId = tag!.Id,
                License = license,
                Orientation = orientation
            };
            var contents = await _searchTagsService.GetTagContents(queryFilter, input);
            long count = await _searchTagsService.CountTagContents(input);

            var outContent = new List<OutputContent>();
            foreach (var content in contents)
            {
                outContent.Add(await _contentTransformer.Transform(content, populate: queryFilter.Populate, userId));
            }
            var response = HttpLib.GeneratePagination(
                outContent,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputContent>>(response, null).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
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
            this._logger.LogError($"Failed to get contents from tag by slug. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents from a Tag by slug"},
                    {"userId", StringLib.SafeString(userId)},
                    {"tagSlug", slug},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"populate", populate}
                });
                 SentrySdk.CaptureException(e);
             });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get contents in a tag by id
    /// </summary>
    /// <param name="id">id of tag</param>
    /// <param name="license">Can be `ALL` or `FREE` or `PREMIUM`</param>
    /// <param name="orientation">Can be `ALL` or `LANDSCAPE` or `PORTRAIT` or `SQUARE`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Retrieved contents from a tag Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}/contents")]
    [ProducesResponseType(typeof(OutputResponse<List<OutputContent>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetContentsFromTag(
        string id,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string license = "ALL",
        [FromQuery] string orientation = "ALL"
    )
    {
        try
        {
            _logger.LogInformation("Getting tag contents");

            var queryFilter = HttpLib.GenerateFilterQuery<Models.Content>(page, pageSize, sort, sortBy, populate);

            var input = new Domains.GetContentsForTagInput
            {
                TagId = id,
                License = license,
                Orientation = orientation
            };
            var contents = await _searchTagsService.GetTagContents(queryFilter, input);
            long count = await _searchTagsService.CountTagContents(input);

            var outContent = new List<OutputContent>();
            foreach (var content in contents)
            {
                outContent.Add(await _contentTransformer.Transform(content, populate: queryFilter.Populate));
            }
            var response = HttpLib.GeneratePagination(
                outContent,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputContent>>(response, null).Result()
            )
            {
                StatusCode = (int)HttpStatusCode.OK
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

            this._logger.LogError($"Failed to get contents from tag by id. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents from a Tag by id"},
                    {"tagId", id},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"license", license},
                    {"orientation", orientation},
                    {"populate", populate}
                });
                 SentrySdk.CaptureException(e);
             });
            return new StatusCodeResult(500);
        }
    }

}
