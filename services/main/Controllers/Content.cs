using System.Net;
using System.Security.Claims;
using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Lib;
using main.Middlewares;
using main.Transformations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Any;

namespace main.Controllers;

[ApiController]
[Route("api/v1/contents")]
public class ContentController : ControllerBase
{
    private readonly ILogger<ContentController> _logger;
    private readonly EditContentService _editContentService;
    private readonly CollectionContentService _collectionContentService;
    private readonly ContentLikeService _contentLikeService;
    private readonly IndexContent _indexContentService;
    private readonly SearchContentService _searchContentService;
    private readonly PurchaseContentService _purchaseContentService;
    private readonly DownloadContentService _downloadContentService;
    private readonly ContentPurchaseTransformer _contentPurchaseTransformer;
    private readonly PaymentTransformer _paymentTransformer;
    private readonly ContentTransformer _contentTransformer;
    private readonly ContentLikeTransformer _contentLikeTransformer;
    private readonly SearchTagService _searchTagsService;
    private readonly Searchcontent.SearchContentService.SearchContentServiceClient _searchServiceRpcClient;
    private readonly AppConstants _appConstants;

    public ContentController(
        ILogger<ContentController> logger,
        ContentLikeService contentLikeService,
        IndexContent indexContentService,
        SearchContentService searchContentService,
        DownloadContentService downloadContentService,
        PurchaseContentService purchaseContentService,
        EditContentService editContentService,
        ContentTransformer contentTransformer,
        ContentLikeTransformer contentLikeTransformer,
        ContentPurchaseTransformer contentPurchaseTransformer,
        PaymentTransformer paymentTransformer,
        SearchTagService searchTagsService,
        CollectionContentService collectionContentService,
        Searchcontent.SearchContentService.SearchContentServiceClient searchServiceRpcClient,
        IOptions<AppConstants> appConstants
    )
    {
        _logger = logger;
        _contentLikeService = contentLikeService;
        _indexContentService = indexContentService;
        _searchContentService = searchContentService;
        _editContentService = editContentService;
        _contentTransformer = contentTransformer;
        _contentLikeTransformer = contentLikeTransformer;
        _searchTagsService = searchTagsService;
        _collectionContentService = collectionContentService;
        _searchServiceRpcClient = searchServiceRpcClient;
        _downloadContentService = downloadContentService;
        _purchaseContentService = purchaseContentService;
        _contentPurchaseTransformer = contentPurchaseTransformer;
        _paymentTransformer = paymentTransformer;
        _appConstants = appConstants.Value;
    }

    /// <summary>
    /// Upload contents
    /// </summary>
    /// <response code="200">Content Uploaded Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<List<Models.Content>>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Save(SaveMedia[] mediaInput)
    {
        try
        {
            _logger.LogInformation("Saving media");
            var currentUser = CurrentUser.GetCurrentUser(
                HttpContext.User.Identity as ClaimsIdentity
            );

            var contents = await _indexContentService.Save(mediaInput, currentUser);

            return new ObjectResult(new GetEntityResponse<List<Models.Content>>(contents, null).Result())
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

            return new ObjectResult(
                new GetEntityResponse<bool>(false, e.Message).Result()
            )
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to save media. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Create Contents"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(mediaInput.ToString())},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieve content by id
    /// </summary>
    /// <param name="id">Id of content</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    [AllowAnonymous]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OutputResponse<OutputContent>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetById(
        string id,
        [FromQuery] string populate = ""
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
            var res = await _searchContentService.GetContentById(id);

            return new ObjectResult(
                new GetEntityResponse<OutputContent>(await _contentTransformer.Transform(res!, populate: populate.Split(","), userId), null).Result()
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

            return new ObjectResult(new GetEntityResponse<OutputUser>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get content. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                     {"action", "Get Content By Id"},
                     {"contentId", id},
                     {"populate", populate},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Download content
    /// </summary>
    /// <param name="id">Id of content</param>
    /// <param name="input"></param>
    [AllowAnonymous]
    [HttpPost("{id}/download")]
    [ProducesResponseType(typeof(OutputResponse<Models.S3MetaData>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadImageBySize(
        string id,
        [FromBody] DTOs.DownloadContentInput input
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
            var res = await _downloadContentService.DownloadContent(new Domains.DownloadContentInput
            {
                ContentId = id,
                Size = input.Size,
                UserId = userId,
            });

            return new ObjectResult(
                new GetEntityResponse<Models.S3MetaData>(res, null).Result()
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

            return new ObjectResult(new GetEntityResponse<object>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Download content. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                     {"action", "Download Content By Id"},
                     {"contentId", id},
                     {"size", input.Size},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Buy content
    /// </summary>
    /// <param name="id">Id of content</param>
    /// <param name="input"></param>
    [Authorize]
    [HttpPost("{id}/buy")]
    [ProducesResponseType(typeof(OutputResponse<DTOs.PurchaseContentOutput>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BuyContent(
        string id,
        [FromBody] DTOs.PurchaseContentInput input
    )
    {
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var purchaseContentOutput = await _purchaseContentService.PurchaseContent(new Domains.PurchaseContentInput
            {
                ContentId = id,
                PaymentMethod = input.PaymentMethod,
                UserId = currentUser.Id,
            });

            if (purchaseContentOutput == null)
            {
                throw new HttpRequestException("Failed to purchase content");
            }

            DTOs.PurchaseContentOutput res = new();

            if (purchaseContentOutput.ContentPurchase != null)
            {
                var outputContentPurchase = await _contentPurchaseTransformer.Transform(purchaseContentOutput.ContentPurchase, default, currentUser.Id);
                res.ContentPurchase = outputContentPurchase;
            }

            if (purchaseContentOutput.Payment != null)
            {
                var outputPayment = _paymentTransformer.Transform(purchaseContentOutput.Payment, default);
                res.Payment = outputPayment;
            }

            return new ObjectResult(
                new GetEntityResponse<DTOs.PurchaseContentOutput>(res, null).Result()
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

            return new ObjectResult(new GetEntityResponse<object>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Purchase content. Exception: {e}");

            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                     {"action", "Purchase Content With Id"},
                     {"contentId", id},
                     {"Payment Method", input.PaymentMethod},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(500);
        }
    }


    /// <summary>
    /// Retrieve content by slug
    /// </summary>
    /// <param name="slug">Slug of content</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    [AllowAnonymous]
    [HttpGet("{slug}/slug")]
    [ProducesResponseType(typeof(OutputResponse<OutputContent>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetBySlug(
        string slug,
        [FromQuery] string populate = ""
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
            var res = await _searchContentService.GetContentBySlug(slug);

            return new ObjectResult(
                new GetEntityResponse<OutputContent>(await _contentTransformer.Transform(res!, populate: populate.Split(","), userId), null).Result()
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

            return new ObjectResult(new GetEntityResponse<OutputUser>(null, e.Message).Result())
            {
                StatusCode = (int)statusCode
            };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get content. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                     {"action", "Get Content By Slug"},
                     {"contentSlug", slug},
                     {"populate", populate},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all contents from a visual search
    /// </summary>
    /// <param name="media">Should be an identifier for your image you uploaded to s3</param>
    /// <param name="license">Can be `ALL` or `FREE` or `PREMIUM`</param>
    /// <param name="orientation">Can be `ALL` or `LANDSCAPE` or `PORTRAIT` or `SQUARE`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Contents Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("search/visual/{media}")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<object>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> VisualSearch(
        string media,
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
            _logger.LogInformation("Getting contents by visual search");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Content>(page, pageSize, sort, sortBy, populate);

            var matches = await _searchContentService.AskRekognitionForMatch(media);

            if (matches == null || matches.Length == 0)
            {
                var res = HttpLib.GeneratePagination<OutputContent, Models.Content>(
                    [],
                    0,
                    queryFilter
                );

                return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputContent>>(res, null).Result())
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }

            var contents = await _searchContentService.VisualSearch(queryFilter, matches, new GetContentsInput
            {
                License = license,
                Orientation = orientation
            });
            var count = await _searchContentService.VisualSearchCount(matches, new GetContentsInput
            {
                License = license,
                Orientation = orientation
            });

            var outContents = new List<OutputContent>();
            foreach (var usercontent in contents)
            {
                outContents.Add(await _contentTransformer.Transform(usercontent, populate: queryFilter.Populate, userId: userId));
            }

            var dataResponse = HttpLib.GeneratePagination(
                outContents,
                count,
                queryFilter
            );

            var response = new
            {
                results = dataResponse,
                imageUrl = $"https://{_appConstants.BucketName}.s3.amazonaws.com/{media}"
            };

            return new ObjectResult(new GetEntityResponse<object>(response, null).Result())
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
            this._logger.LogError($"Failed to get contents. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                        {"action", "Visual Search"},
                        {"userId", StringLib.SafeString(userId)},
                        {"populate", populate},
                        {"license", license},
                        {"orientation", orientation},
                        {"page", StringLib.SafeString(page.ToString())},
                        {"pageSize", StringLib.SafeString(pageSize.ToString())},
                        {"sort", StringLib.SafeString(sort)},
                        {"sortBy", sortBy},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Retrieves all contents from a textual search
    /// </summary>
    /// <param name="search">Should be a string</param>
    /// <param name="license">Can be `ALL` or `FREE` or `PREMIUM`</param>
    /// <param name="orientation">Can be `ALL` or `LANDSCAPE` or `PORTRAIT` or `SQUARE`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Contents Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("search/textual")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputContent>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> TextualSearch(
        [FromQuery] string? search,
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
            if (search == null)
            {
                throw new HttpRequestException("Search query is required");
            }

            _logger.LogInformation("Getting contents by textual search");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Content>(page, pageSize, sort, sortBy, populate);

            Searchcontent.SearchResponse? searchResponse = null;

            try
            {
                var searchResults = await _searchServiceRpcClient.SearchAsync(
                    new Searchcontent.SearchRequest
                    {
                        Keyword = search,
                        // TODO: add these to the search filters
                        // License = license,
                        // Orientation = orientation

                        Take = queryFilter.Limit,
                        Skip = queryFilter.Skip,
                    },
                    new Grpc.Core.Metadata
                    {
                        new Grpc.Core.Metadata.Entry("Authorization", "Bearer " + _appConstants.SearchServiceAuthToken)
                    }
                );

                if (searchResults is null)
                {
                    throw new Exception();
                }

                searchResponse = searchResults;
            }
            catch (System.Exception)
            {
                // We're hoping search service will notify us.
                throw new HttpRequestException("Failed to search content");
            }

            var contentIds = searchResponse is not null ? searchResponse.Contents.Select(c => c).ToList() : new List<string>();

            var contents = await _searchContentService.TextualSearch(contentIds);

            var count = await _searchContentService.TextualSearchCount(contentIds);


            var outContents = new List<OutputContent>();
            foreach (var usercontent in contents)
            {
                outContents.Add(await _contentTransformer.Transform(usercontent, populate: queryFilter.Populate, userId: userId));
            }

            var response = HttpLib.GeneratePagination(
                outContents,
                count,
                queryFilter
            );

            return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputContent>>(response, null).Result())
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
            this._logger.LogError($"Failed to get contents. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                        {"action", "Textual Search"},
                        {"userId", StringLib.SafeString(userId)},
                        {"populate", populate},
                        {"license", license},
                        {"orientation", orientation},
                        {"page", StringLib.SafeString(page.ToString())},
                        {"pageSize", StringLib.SafeString(pageSize.ToString())},
                        {"sort", StringLib.SafeString(sort)},
                        {"sortBy", sortBy},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Retrieves all contents
    /// </summary>
    /// <param name="is_featured">Can be `true` or `false`</param>
    /// <param name="license">Can be `ALL` or `FREE` or `PREMIUM`</param>
    /// <param name="orientation">Can be `ALL` or `LANDSCAPE` or `PORTRAIT` or `SQUARE`</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Contents Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet()]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputContent>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetAllContents(
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at",
        [FromQuery] string license = "ALL",
        [FromQuery] string orientation = "ALL",
        [FromQuery] bool is_featured = false
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

            _logger.LogInformation("Getting contents");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Content>(page, pageSize, sort, sortBy, populate);

            var contents = await _searchContentService.GetContents(queryFilter, new GetContentsInput
            {
                License = license,
                Orientation = orientation,
                IsFeatured = is_featured
            });

            var count = await _searchContentService.GetContentsCount(new GetContentsInput
            {
                License = license,
                Orientation = orientation,
                IsFeatured = is_featured
            });


            var outContents = new List<OutputContent>();
            foreach (var usercontent in contents)
            {
                outContents.Add(await _contentTransformer.Transform(usercontent, populate: queryFilter.Populate, userId: userId));
            }

            var response = HttpLib.GeneratePagination(
                outContents,
                count,
                queryFilter
            );

            return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputContent>>(response, null).Result())
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
            this._logger.LogError($"Failed to get contents. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                        {"action", "Get all contents"},
                        {"populate", populate},
                        {"license", license},
                        {"orientation", orientation},
                        {"page", StringLib.SafeString(page.ToString())},
                        {"pageSize", StringLib.SafeString(pageSize.ToString())},
                        {"sort", StringLib.SafeString(sort)},
                        {"sortBy", sortBy},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


    /// <summary>
    /// Resolves related contents.
    /// </summary>
    /// <param name="contentId">Id of content</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Contents Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("{contentId}/related")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputContent>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetRelatedContents(
        string contentId,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at"
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

            _logger.LogInformation("Getting related contents to: " + contentId);
            var queryFilter = HttpLib.GenerateFilterQuery<Models.Content>(page, pageSize, sort, sortBy, populate);

            var content = await _searchContentService.GetContentById(contentId);

            var contentTags = await _searchTagsService.GetTagsContentByContentId(content.Id);
            var tagsId = contentTags.Select(t => t.TagId).ToList();

            var contents = await _searchContentService.GetRelatedContents(queryFilter, contentId, tagsId);
            var count = await _searchContentService.GetRelatedContentsCount(contentId, tagsId);

            var outContents = new List<OutputContent>();
            foreach (var usercontent in contents)
            {
                outContents.Add(await _contentTransformer.Transform(usercontent, populate: queryFilter.Populate, userId: userId));
            }

            var response = HttpLib.GeneratePagination(
                outContents,
                count,
                queryFilter
            );

            return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputContent>>(response, null).Result())
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
            this._logger.LogError($"Failed to get related contents. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
           {
               scope.SetTags(new Dictionary<string, string>
               {
                        {"action", "Related Contents"},
                        {"contentId", contentId},
                        {"userId", StringLib.SafeString(userId)},
                        {"populate", populate},
                        {"page", StringLib.SafeString(page.ToString())},
                        {"pageSize", StringLib.SafeString(pageSize.ToString())},
                        {"sort", StringLib.SafeString(sort)},
                        {"sortBy", sortBy},
               });
               SentrySdk.CaptureException(e);
           });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }


    /// <summary>
    /// Edits a content
    /// </summary>
    /// <response code="200">Content Edited Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(OutputResponse<Models.Content>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> EditContent(string id, [FromBody] DTOs.EditContentBasicDetailsInput input)
    {
        try
        {
            _logger.LogInformation("Update basic deets on content: " + id);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var content = await _editContentService.EditContent(new Domains.EditContentBasicDetailsInput
            {
                ContentId = id,
                UserId = currentUser.Id,
                Amount = input.Amount,
                Title = input.Title,
                Visibility = input.Visibility
            });

            return new ObjectResult(new GetEntityResponse<Models.Content>(content, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Update basic deets on content. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Update basic details on content"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"contentId", id},
                    {"body", StringLib.SafeString(input.ToString())},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Likes a content
    /// </summary>
    /// <response code="200">Content Liked Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpPost("{id}/likes")]
    [ProducesResponseType(typeof(OutputResponse<Models.ContentLike>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LikeContent(string id)
    {
        try
        {
            _logger.LogInformation("Like content: " + id);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var contentLike = await _contentLikeService.Create(new Domains.ContentLikeInput
            {
                ContentId = id,
                UserId = currentUser.Id
            });

            return new ObjectResult(new GetEntityResponse<Models.ContentLike>(contentLike, null).Result()) { StatusCode = StatusCodes.Status201Created };
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
            this._logger.LogError($"Failed to like content. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Like Content"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"contentId", id},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Unlike a content
    /// </summary>
    /// <response code="200">Content Unlike Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize]
    [HttpDelete("{id}/likes")]
    [ProducesResponseType(typeof(OutputResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UnlikeContent(string id)
    {
        try
        {
            _logger.LogInformation("Like content: " + id);
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            var contentLike = await _contentLikeService.Delete(new Domains.ContentLikeInput
            {
                ContentId = id,
                UserId = currentUser.Id
            });

            return new ObjectResult(new GetEntityResponse<bool>(true, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to unlike content. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Unlike Content"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"contentId", id},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }


    /// <summary>
    /// Retrieves all contents's likes on the platform
    /// </summary>
    /// <param name="id">Id of content</param>
    /// <param name="populate">Comma separated values to populate fields</param>
    /// <param name="search">Search by name</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">Content Likes Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpGet("{id}/likes")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputContentLike>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetUserContentLikes(
        string id,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string populate = "",
        [FromQuery] string sortBy = "created_at"
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
            _logger.LogInformation("Getting all user's content likes");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.ContentLike>(page, pageSize, sort, sortBy, populate);
            var contents = await _contentLikeService.GetContentLikes(queryFilter, id);
            long count = await _contentLikeService.CountContentLikes(id);

            var outContent = new List<OutputContentLike>();
            foreach (var content in contents)
            {
                outContent.Add(await _contentLikeTransformer.Transform(content, populate: queryFilter.Populate, userId));
            }
            var response = HttpLib.GeneratePagination(
                outContent,
                count,
                queryFilter
            );

            return new ObjectResult(
                new GetEntityResponse<EntityWithPagination<OutputContentLike>>(response, null).Result()
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
            this._logger.LogError($"Failed to get user's content likes. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
          {
              scope.SetTags(new Dictionary<string, string>
              {
                    {"action", "Get user's content likes"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"populate", StringLib.SafeString(populate)},
                    {"search", StringLib.SafeString(search)},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
              });
              SentrySdk.CaptureException(e);
          });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Feature content.
    /// </summary>
    /// <param name="id">id of content</param>
    /// <response code="200">content Featured Successfully</response>
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
    public async Task<IActionResult> FeatureContent(string id)
    {
        try
        {
            _logger.LogInformation("Featuring content: " + id);
            var collectionContent = await _collectionContentService.FeatureContent(id);

            return new ObjectResult(new GetEntityResponse<Models.CollectionContent>(collectionContent, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to feature content. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Feature content"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Feature content.
    /// </summary>
    /// <param name="id">id of content</param>
    /// <response code="200">content UnFeatured Successfully</response>
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
    public async Task<IActionResult> UnFeatureContent(string id)
    {
        try
        {
            _logger.LogInformation("UnFeaturing content: " + id);
            var collectionContent = await _collectionContentService.UnFeatureContent(id);

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
