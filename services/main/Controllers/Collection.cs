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
            this._logger.LogDebug($"Failed to create collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Create Collection"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(input.ToString())},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Creates a collection by an admin
    /// </summary>
    /// <response code="201">Collection Created Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost("admin")]
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status201Created)]
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
            this._logger.LogDebug($"Failed to create collection for admin. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Create Collection For Admin"},
                    {"adminId", CurrentAdmin.GetCurrentAdmin(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(input.ToString())},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves single collection by id
    /// </summary>
    /// <param name="id">Id of collection</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="contentItemsLimit">Number of content items to populate on collection</param>
    /// <response code="201">Collections Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Get(
        string id,
        [FromQuery] string? populate,
        [FromQuery] int contentItemsLimit = 4
    )
    {
        populate ??= "";
        try
        {
            _logger.LogInformation("Getting collection: " + id);
            var collection = _collectionService.GetCollection(id);

            var outputCOllection = await _collectionTransformer.Transform(collection, populate: populate.Split(","), contentItemsLimit);
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
            this._logger.LogDebug($"Failed to get collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Get Collection By Id"},
                    {"collectionId", id},
                    {"populate", populate},
                    {"contentItemsLimit", contentItemsLimit.ToString()},
               });
               SentrySdk.CaptureException(e);
           });
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
    [HttpGet("{slug}/slug")]
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBySlug(
        string slug,
        [FromQuery] string? populate,
        [FromQuery] int contentItemsLimit = 4
    )
    {
        populate ??= "";
        try
        {
            _logger.LogInformation("Getting collection: " + slug);
            var collection = _collectionService.GetCollectionBySlug(slug);

            var outputCOllection = await _collectionTransformer.Transform(collection, populate: populate.Split(","), contentItemsLimit);
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
            this._logger.LogDebug($"Failed to get collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Get Collection By Slug"},
                    {"collectionSlug", slug},
                    {"populate", populate},
                    {"contentItemsLimit", contentItemsLimit.ToString()},
               });
               SentrySdk.CaptureException(e);
           });
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
        [FromQuery] int contentItemsLimit = 4
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
                outContent.Add(await _collectionTransformer.Transform(content, populate: queryFilter.Populate, contentItemsLimit));
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
            this._logger.LogDebug($"Failed to get collections. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get Collections"},
                    {"populate", StringLib.SafeString(populate)},
                    {"search", StringLib.SafeString(search)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"contentItemsLimit", contentItemsLimit.ToString()},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Updates a collection
    /// </summary>
    /// <param name="id">id of collection</param>
    /// <param name="input"></param>
    /// <response code="200">Update collection Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(OutputResponse<Collection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult UpdateCollection(string id, [FromBody] UpdateCollectionInput input)
    {
        try
        {
            _logger.LogInformation("updating collection: " + input);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var collection = _collectionService.UpdateCollection(new Domains.UpdateCollection
            {
                Id = id,
                UserId = currentUser.Id,
                Name = input.Name,
                Description = input.Description,
                Visibility = input.Visibility
            });

            return new ObjectResult(new GetEntityResponse<Models.Collection>(collection, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogDebug($"Failed to update collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Update Collections"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(input.ToString())},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Deletes a collection
    /// </summary>
    /// <param name="id">id of collection</param>
    /// <response code="204">Remove collection Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult RemoveCollection(string id)
    {
        try
        {
            throw new Exception("Not Implemented");
        }
        catch (Exception e)
        {

            this._logger.LogDebug($"Failed to delete collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Remove Collections"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(id)}
                });
                 SentrySdk.CaptureException(e);
             });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Adds content to collection
    /// </summary>
    /// <param name="id">id of collection</param>
    /// <param name="input"></param>
    /// <response code="201">Added contents to collection Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost("{id}/contents")]
    [ProducesResponseType(typeof(OutputResponse<List<Models.CollectionContent>>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult AddContentToCollection(string id, [FromBody] AddContentsToCollectionInput input)
    {
        try
        {
            throw new Exception("Not Implemented");
        }
        catch (Exception e)
        {

            this._logger.LogDebug($"Failed to add contents to collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Add Contents to Collection"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"collectionId", id},
                    {"body", StringLib.SafeString(input.ToString())}
                });
                 SentrySdk.CaptureException(e);
             });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Remove content from collection
    /// </summary>
    /// <param name="id">id of collection</param>
    /// <param name="input"></param>
    /// <response code="204">Remove contents from collection Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpDelete("{id}/contents")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult RemoveContentFromCollection(string id, [FromBody] RemoveContentsFromCollectionInput input)
    {
        try
        {
            throw new Exception("Not Implemented");
        }
        catch (Exception e)
        {

            this._logger.LogDebug($"Failed to remove contents from collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Remove Contents from Collection"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"collectionId", id},
                    {"body", StringLib.SafeString(input.ToString())}
                });
                 SentrySdk.CaptureException(e);
             });
            return new StatusCodeResult(500);
        }

    }

    /// <summary>
    /// Get contents in a collection by slug
    /// </summary>
    /// <param name="slug">slug of collection</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Retrieved contents from a collection Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{slug}/contents/slug")]
    [ProducesResponseType(typeof(OutputResponse<List<Models.CollectionContent>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetContentFromCollectionBySlug(
        string slug,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            throw new Exception("Not Implemented");
        }
        catch (Exception e)
        {

            this._logger.LogDebug($"Failed to get contents from collection by slug. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents from a Collection by slug"},
                    {"collectionSlug", slug},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy}
                });
                 SentrySdk.CaptureException(e);
             });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get all contents in a collection by id
    /// </summary>
    /// <param name="id">id of collection</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Retrieved contents from a collection Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}/contents")]
    [ProducesResponseType(typeof(OutputResponse<List<Models.CollectionContent>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetContentFromCollection(
        string id,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            throw new Exception("Not Implemented");
        }
        catch (Exception e)
        {
            this._logger.LogDebug($"Failed to get contents from collection by id. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents from a Collection by id"},
                    {"collectionId", id},
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

}
