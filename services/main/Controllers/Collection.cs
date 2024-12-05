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
using NanoidDotNet;
using main.Models;

namespace main.Controllers;

[ApiController]
[Route("api/v1/collections")]
public class CollectionsController : ControllerBase
{
    private readonly ILogger<CollectionsController> _logger;
    private readonly CollectionService _collectionService;
    private readonly CollectionTransformer _collectionTransformer;

    public CollectionsController(
        ILogger<CollectionsController> logger,
        CollectionService collectionService,
        CollectionTransformer collectionTransformer
    )
    {
        _logger = logger;
        _collectionService = collectionService;
        _collectionTransformer = collectionTransformer;
    }

    /// <summary>
    /// Creates a collection by a user
    /// </summary>
    /// <response code="200">Collection Created Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<Models.Collection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Create([FromBody] CreateCollectionInput input)
    {
        try
        {
            _logger.LogInformation("Saving collection: " + input);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var collection = _collectionService.SaveCollection(new Domains.SaveCollection
            {
                Name = input.Name,
                Slug = $"{input.Name.ToLower().Replace(" ", "_")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 10)}",
                Description = input.Description,
                CreatedById = currentUser.Id,
                CreatedByRole = CollectionCreatedByRole.USER,
                Visibility = input.Visibility
            });

            return new ObjectResult(new GetEntityResponse<Models.Collection>(collection, null).Result()) { StatusCode = StatusCodes.Status201Created };
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
            this._logger.LogError($"Failed to save collection. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Creates a collection by an admin
    /// </summary>
    /// <response code="200">Collection Created Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost("admin")]
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult CreateForAdmin([FromBody] CreateCollectionInput input)
    {
        try
        {
            _logger.LogInformation("Saving collection: " + input);
            var collection = _collectionService.SaveCollection(new Domains.SaveCollection
            {
                Name = input.Name,
                Slug = $"{input.Name.ToLower().Replace(" ", "_")}_{Nanoid.Generate("abcdefghijklmnopqrstuvwxyz", 10)}",
                Description = input.Description,
                CreatedByRole = CollectionCreatedByRole.SYSTEM,
                Visibility = input.Visibility,
            });

            return new ObjectResult(new GetEntityResponse<Models.Collection>(collection, null).Result()) { StatusCode = StatusCodes.Status201Created };
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
            this._logger.LogError($"Failed to save collection. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves single collection by id
    /// </summary>
    /// <param name="id">Id of collection</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="contentItemsLimit">Number of content items to populate on collection</param>
    /// <response code="200">Collections Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Get(
        string id,
        [FromQuery] string? populate,
        [FromQuery] string contentItemsLimit = "4"
    )
    {
        populate ??= "";
        try
        {
            _logger.LogInformation("Getting collection: " + id);
            var collection = _collectionService.GetCollection(id);

            var outputCOllection = await _collectionTransformer.Transform(collection, populate: populate.Split(","), contentItemsLimit: int.Parse(contentItemsLimit));
            return new ObjectResult(
                new GetEntityResponse<OutputCollection>(outputCOllection, null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to get collection. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves single collection by slug
    /// </summary>
    /// <param name="slug">slug of collection</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="contentItemsLimit">Number of content items to populate on collection</param>
    /// <response code="200">Collections Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBySlug(
        string slug,
        [FromQuery] string? populate,
        [FromQuery] string contentItemsLimit = "4"
    )
    {
        populate ??= "";
        try
        {
            _logger.LogInformation("Getting collection: " + slug);
            var collection = _collectionService.GetCollectionBySlug(slug);

            var outputCOllection = await _collectionTransformer.Transform(collection, populate: populate.Split(","), contentItemsLimit: int.Parse(contentItemsLimit));
            return new ObjectResult(
                new GetEntityResponse<OutputCollection>(outputCOllection, null).Result()
            )
            { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to get collection. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all collections on the platform
    /// </summary>
    /// <param name="contentItemsLimit">Number of content items to populate on collection</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="search">Search by name</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Collections Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputCollection>>)
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
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string contentItemsLimit = "4"
    )
    {
        try
        {
            _logger.LogInformation("Getting all collections");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Collection>(page, pageSize, sort, sortBy, populate);

            var contents = await _collectionService.GetCollections(queryFilter, search);
            long count = await _collectionService.CountCollections(search);

            var outContent = new List<OutputCollection>();
            foreach (var content in contents)
            {
                outContent.Add(await _collectionTransformer.Transform(content, populate: queryFilter.Populate, contentItemsLimit: int.Parse(contentItemsLimit)));
            }
            var response = HttpLib.GeneratePagination(
                outContent,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCollection>>(response, null).Result()
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
            this._logger.LogError($"Failed to get collections. Exception: {e}");
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

}
