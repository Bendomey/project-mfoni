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
    private readonly CollectionContentService _collectionContentService;
    private readonly CollectionContentTransformer _collectionContentTransformer;
    private readonly CollectionTransformer _collectionTransformer;

    public CollectionsController(
        ILogger<CollectionsController> logger,
        CollectionService collectionService,
        CollectionContentService collectionContentService,
        CollectionTransformer collectionTransformer,
        CollectionContentTransformer collectionContentTransformer
    )
    {
        _logger = logger;
        _collectionService = collectionService;
        _collectionContentService = collectionContentService;
        _collectionTransformer = collectionTransformer;
        _collectionContentTransformer = collectionContentTransformer;
    }

    /// <summary>
    /// Creates a collection by a user
    /// </summary>
    /// <response code="200">Collection Created Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<Models.Collection>), StatusCodes.Status201Created)]
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
            this._logger.LogError($"Failed to create collection. Exception: {e}");
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
            this._logger.LogError($"Failed to create collection for admin. Exception: {e}");
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
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Get(
        string id,
        [FromQuery] string populate = "",
        [FromQuery] int contentItemsLimit = 4
    )
    {
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
            this._logger.LogError($"Failed to get collection. Exception: {e}");
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
        [FromQuery] string populate = "",
        [FromQuery] int contentItemsLimit = 4
    )
    {
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
            this._logger.LogError($"Failed to get collection. Exception: {e}");
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
    /// Retrieves single collection by name
    /// </summary>
    /// <param name="name">slug of collection</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="contentItemsLimit">Number of content items to populate on collection</param>
    /// <response code="200">Collections Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{name}/name")]
    [ProducesResponseType(typeof(OutputResponse<OutputCollection>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetByName(
        string name,
        [FromQuery] string populate = "",
        [FromQuery] int contentItemsLimit = 4
    )
    {
        try
        {
            _logger.LogInformation("Getting collection: " + name);
            var collection = _collectionService.GetCollectionByName(name);

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
            this._logger.LogError($"Failed to get collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                    {"action", "Get Collection By name"},
                    {"collectionName", name},
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
    /// <param name="created_by">could be an id of a user</param>
    /// <param name="visibility">could be `ALL` or `PUBLIC` or `PRIVATE`</param>
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
        [FromQuery] string? created_by,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] int contentItemsLimit = 4,
        [FromQuery] string visibility = "PUBLIC"
    )
    {
        try
        {
            _logger.LogInformation("Getting all collections");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Collection>(page, pageSize, sort, sortBy, populate);

            var input = new GetCollectionsInput
            {
                Visibility = visibility,
                Query = search,
                CreatedById = created_by
            };
            var contents = await _collectionService.GetCollections(queryFilter, input);
            long count = await _collectionService.CountCollections(input);

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
            this._logger.LogError($"Failed to get collections. Exception: {e}");
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
                    {"visibility", visibility}
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
            this._logger.LogError($"Failed to update collection. Exception: {e}");
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

            this._logger.LogError($"Failed to delete collection. Exception: {e}");
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
    public IActionResult AddContentToCollection(string id, [FromBody] DTOs.AddContentsToCollectionInput input)
    {
        try
        {
            _logger.LogInformation("adding collection contents: " + input);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var contents = _collectionContentService.AddContentsToCollection(new Domains.AddContentsToCollectionInput
            {
                ContentIds = input.ContentIds,
                Id = id,
                UserId = currentUser.Id
            });

            return new ObjectResult(new GetEntityResponse<List<Models.CollectionContent>>(contents, null).Result()) { StatusCode = StatusCodes.Status201Created };
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

            this._logger.LogError($"Failed to add contents to collection. Exception: {e}");
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
    public IActionResult RemoveContentFromCollection(string id, [FromBody] DTOs.RemoveContentsFromCollectionInput input)
    {
        try
        {
            _logger.LogInformation("remove collection contents: " + input);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var res = _collectionContentService.RemoveContentsFromCollection(new Domains.RemoveContentsFromCollectionInput
            {
                ContentIds = input.ContentIds,
                Id = id,
                UserId = currentUser.Id,
                Type = input.Type
            });

            return new EmptyResult();
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

            this._logger.LogError($"Failed to remove contents from collection. Exception: {e}");
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
    /// <param name="visibility">can be `ALL`, `PUBLIC`, `PRIVATE`</param>
    /// <param name="orientation">can be `ALL`, `LANDSCAPE`, `PORTRIAT`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Retrieved contents from a collection Successfully</response>
    /// <response code="500">An unexpected error occured</response>]
    [AllowAnonymous]
    [HttpGet("{slug}/slug/contents")]
    [ProducesResponseType(typeof(OutputResponse<List<OutputCollectionContent>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetContentsFromCollectionBySlug(
        string slug,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string visibility = "PUBLIC",
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
            _logger.LogInformation("Getting collection contents");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.CollectionContent>(page, pageSize, sort, sortBy, populate);

            List<CollectionContent> contents = [];
            long count = 0;
            try
            {
                var collection = _collectionService.GetCollectionBySlug(slug);


                contents = await _collectionContentService.GetCollectionContents(queryFilter, new Domains.GetCollectionContentsInput
                {
                    CollectionId = collection.Id,
                    Visibility = visibility,
                    Orientation = orientation
                });

                count = await _collectionContentService.CountCollectionContents(new Domains.GetCollectionContentsInput
                {
                    CollectionId = collection.Id,
                    Visibility = visibility,
                    Orientation = orientation
                });
            }
            catch (HttpRequestException) { }

            var outContent = new List<OutputCollectionContent>();
            foreach (var content in contents)
            {
                outContent.Add(await _collectionContentTransformer.Transform(content, populate: queryFilter.Populate, userId: userId));
            }
            var response = HttpLib.GeneratePagination(
                outContent,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCollectionContent>>(response, null).Result()
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

            this._logger.LogError($"Failed to get contents from collection by slug. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents from a Collection by slug"},
                    {"collectionSlug", slug},
                    {"visibility", visibility},
                    {"orientation", orientation},
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
    /// Get contents in a collection by name
    /// </summary>
    /// <param name="name">name of collection</param>
    /// <param name="visibility">can be `ALL`, `PUBLIC`, `PRIVATE`</param>
    /// <param name="orientation">can be `ALL`, `LANDSCAPE`, `PORTRIAT`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Retrieved contents from a collection Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("{name}/name/contents")]
    [ProducesResponseType(typeof(OutputResponse<List<OutputCollectionContent>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetContentsFromCollectionByName(
        string name,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string visibility = "PUBLIC",
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
            _logger.LogInformation("Getting collection contents");

            var queryFilter = HttpLib.GenerateFilterQuery<Models.CollectionContent>(page, pageSize, sort, sortBy, populate);

            List<CollectionContent> contents = [];
            long count = 0;
            try
            {
                var collection = _collectionService.GetCollectionByName(name);
                contents = await _collectionContentService.GetCollectionContents(queryFilter, new Domains.GetCollectionContentsInput
                {
                    CollectionId = collection.Id,
                    Visibility = visibility,
                    Orientation = orientation
                });
                count = await _collectionContentService.CountCollectionContents(new Domains.GetCollectionContentsInput
                {
                    CollectionId = collection.Id,
                    Visibility = visibility,
                    Orientation = orientation
                });

            }
            catch (HttpRequestException) { }


            var outContent = new List<OutputCollectionContent>();
            foreach (var content in contents)
            {
                outContent.Add(await _collectionContentTransformer.Transform(content, populate: queryFilter.Populate, userId: userId));
            }
            var response = HttpLib.GeneratePagination(
                outContent,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCollectionContent>>(response, null).Result()
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

            this._logger.LogError($"Failed to get contents from collection by name. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents from a Collection by name"},
                    {"collectionName", name},
                    {"visibility", visibility},
                    {"orientation", orientation},
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
    /// <param name="visibility">can be `ALL`, `PUBLIC`, `PRIVATE`</param>
    /// <param name="orientation">can be `ALL`, `LANDSCAPE`, `PORTRIAT`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Retrieved contents from a collection Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("{id}/contents")]
    [ProducesResponseType(typeof(OutputResponse<List<Models.CollectionContent>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetContentFromCollection(
        string id,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string visibility = "PUBLIC",
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
            _logger.LogInformation("Getting collection contents");

            var queryFilter = HttpLib.GenerateFilterQuery<Models.CollectionContent>(page, pageSize, sort, sortBy, populate);

            var contents = await _collectionContentService.GetCollectionContents(queryFilter, new Domains.GetCollectionContentsInput
            {
                CollectionId = id,
                Visibility = visibility,
                Orientation = orientation
            });
            long count = await _collectionContentService.CountCollectionContents(new Domains.GetCollectionContentsInput
            {
                CollectionId = id,
                Visibility = visibility,
                Orientation = orientation
            });

            var outContent = new List<OutputCollectionContent>();
            foreach (var content in contents)
            {
                outContent.Add(await _collectionContentTransformer.Transform(content, populate: queryFilter.Populate, userId: userId));
            }
            var response = HttpLib.GeneratePagination(
                outContent,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputCollectionContent>>(response, null).Result()
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
            this._logger.LogError($"Failed to get contents from collection by id. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents from a Collection by id"},
                    {"collectionId", id},
                    {"visibility", visibility},
                    {"orientation", orientation},
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
    /// Get all content count in a collection by name
    /// </summary>
    /// <param name="name">name of collection</param>
    /// <response code="200">Retrieved contents from a collection Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{name}/name/contents/count")]
    [ProducesResponseType(typeof(OutputResponse<long>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetContentsCountFromCollection(
        string name
    )
    {
        try
        {
            _logger.LogInformation("Getting collection contents count");
            string? id = null;
            long count = 0;

            try
            {
                var collection = _collectionService.GetCollectionByName(name);
                id = collection.Id;
            }
            catch (Exception) { }

            count = await _collectionContentService.CountCollectionContents(new Domains.GetCollectionContentsInput
            {
                CollectionId = id,
            });

            return new ObjectResult(
                new GetEntityResponse<long>(count, null).Result()
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
            this._logger.LogError($"Failed to get contents count from collection by name. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
             {
                 scope.SetTags(new Dictionary<string, string>
                 {
                    {"action", "Get Contents Count from a Collection by  name"},
                    {"collectionName", name},

                });
                 SentrySdk.CaptureException(e);
             });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Feature collection.
    /// </summary>
    /// <param name="id">id of collection</param>
    /// <response code="200">Collection Featured Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpPatch("{id}/feature")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<Models.CollectionContent>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> FeatureTag(string id)
    {
        try
        {
            _logger.LogInformation("Featuring collection: " + id);
            var collectionContent = await _collectionContentService.FeatureCollection(id);

            return new ObjectResult(new GetEntityResponse<CollectionContent>(collectionContent, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to feature collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Feature collection"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Feature collection.
    /// </summary>
    /// <param name="id">id of collection</param>
    /// <response code="200">Collection UnFeatured Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpPatch("{id}/unfeature")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<bool>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> UnFeatureCollection(string id)
    {
        try
        {
            _logger.LogInformation("UnFeaturing collection: " + id);
            var collectionContent = await _collectionContentService.UnFeatureCollection(id);

            return new ObjectResult(new GetEntityResponse<bool>(collectionContent, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to unfeature collection. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Unfeature collection"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }


}
