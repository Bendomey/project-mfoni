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
using main.Models;
using System.Threading.Tasks;

namespace main.Controllers;

[ApiController]
[Route("api/v1/report-content-cases")]
public class ReportContentCasesController : ControllerBase
{
    private readonly ILogger<ReportContentCasesController> _logger;
    private readonly ReportContentCaseService _reportContentCaseService;
    private readonly ReportContentCaseTransformer _reportContentCaseTransformer;

    public ReportContentCasesController(
        ILogger<ReportContentCasesController> logger,
        ReportContentCaseService reportContentCaseService,
        ReportContentCaseTransformer reportContentCaseTransformer
    )
    {
        _logger = logger;
        _reportContentCaseService = reportContentCaseService;
        _reportContentCaseTransformer = reportContentCaseTransformer;
    }

    /// <summary>
    /// Submits a report for a content
    /// </summary>
    /// <response code="200">ContentResponseCase Created Successfully</response>
    /// <response code="401">Unauthorize</response>
    /// <response code="500">An unexpected error occured</response>
    [AllowAnonymous]
    [HttpPost]
    [ProducesResponseType(typeof(OutputResponse<Models.ReportContentCase>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(OutputResponse<AnyType>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitCase([FromBody] SubmitContentReportCaseInput input)
    {
        string? userId = null;
        try
        {
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);
            userId = currentUser.Id;
        }
        catch (System.Exception) { }

        try
        {
            _logger.LogInformation("Submitting case: " + input);
            var reportCase = await _reportContentCaseService.Submit(new Domains.SubmitContentReportInput
            {
                UserId = userId,
                Name = input.Name,
                Phone = input.Phone,
                Email = input.Email,
                ContentType = input.ContentType,
                ContentSlug = input.ContentSlug,
                ReasonForReport = input.ReasonForReport,
                BreakingLocalLaws = input.BreakingLocalLaws,
                AdditionalDetails = input.AdditionalDetails
            });

            return new ObjectResult(new GetEntityResponse<Models.ReportContentCase>(reportCase, null).Result()) { StatusCode = StatusCodes.Status201Created };
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
            this._logger.LogError($"Failed to submit case. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Submit Report Content Case"},
                    {"userId", CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity).Id},
                    {"body", StringLib.SafeString(input.ToString())},
                });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get case by id
    /// </summary>
    /// <param name="id">id of ContentReportCase</param>
    /// <response code="200">ContentReportCase Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputReportContentCase>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> Get(string id)
    {
        try
        {
            _logger.LogInformation("Getting case: " + id);
            var reportCase = await _reportContentCaseService.GetCaseById(id);

            var outputTag = await _reportContentCaseTransformer.Transform(reportCase);
            return new ObjectResult(new GetEntityResponse<OutputReportContentCase>(outputTag, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to get case. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get ReportContentCase by id"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }


    // /// <summary>
    // /// Retrieves all cases on the platform
    // /// </summary>
    // /// <param name="content_id">Id of content</param>
    // /// <param name="content_type">Can be ALL | IMAGE | COLLECTION | TAG</param>
    // /// <param name="status">Can be ALL | SUBMITTED | ACKNOWLEDGED | RESOLVED</param>
    // /// <param name="populate">Comma separated values to populate fields</param>
    // /// <param name="search">Search by name</param>
    // /// <param name="page">The page to be navigated to</param>
    // /// <param name="pageSize">The number of items on a page</param>
    // /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    // /// <param name="sortBy">What field to sort by.</param>
    // /// <response code="200">Tags Retrieved Successfully</response>
    // /// <response code="500">An unexpected error occured</response>
    // [Authorize(Policy = "Admin")]
    // [HttpGet]
    // [ProducesResponseType(
    //     StatusCodes.Status200OK,
    //     Type = typeof(ApiEntityResponse<EntityWithPagination<OutputTag>>)
    // )]
    // [ProducesResponseType(
    //     StatusCodes.Status500InternalServerError,
    //     Type = typeof(StatusCodeResult)
    // )]
    // public async Task<IActionResult> GetAll(
    //     [FromQuery] string? search,
    //     [FromQuery] int? page,
    //     [FromQuery] int? pageSize,
    //     [FromQuery] string? sort,
    //     [FromQuery] string? content_id,
    //     [FromQuery] string? content_type = "ALL",
    //     [FromQuery] string? status = "ALL",
    //     [FromQuery] string populate = "",
    //     [FromQuery] string sortBy = "created_at"
    // )
    // {
    //     try
    //     {
    //         _logger.LogInformation("Getting all tags");
    //         var queryFilter = HttpLib.GenerateFilterQuery<Models.Tag>(page, pageSize, sort, sortBy, populate);
    //         var tags = await _searchTagsService.GetAll(queryFilter, search);
    //         var tagsCount = await _searchTagsService.Count(search);

    //         var outputTags = new List<OutputTag>();
    //         foreach (var tag in tags)
    //         {
    //             outputTags.Add(await _tagTransformer.Transform(tag, populate: queryFilter.Populate));
    //         }
    //         var response = HttpLib.GeneratePagination(outputTags, tagsCount, queryFilter);
    //         return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputTag>>(response, null).Result()) { StatusCode = (int)HttpStatusCode.OK };
    //     }
    //     catch (HttpRequestException e)
    //     {
    //         var statusCode = HttpStatusCode.BadRequest;
    //         if (e.StatusCode != null)
    //         {
    //             statusCode = (HttpStatusCode)e.StatusCode;
    //         }

    //         return new ObjectResult(new GetEntityResponse<AnyType?>(null, e.Message).Result()) { StatusCode = (int)statusCode };
    //     }
    //     catch (Exception e)
    //     {
    //         this._logger.LogError($"Failed to get tags. Exception: {e}");
    //         SentrySdk.ConfigureScope(scope =>
    //         {
    //             scope.SetTags(new Dictionary<string, string>
    //             {
    //                 {"action", "Get All Tags"},
    //                 {"page", StringLib.SafeString(page.ToString())},
    //                 {"pageSize", StringLib.SafeString(pageSize.ToString())},
    //                 {"sort", StringLib.SafeString(sort)},
    //                 {"sortBy", sortBy},
    //                 {"populate", populate},
    //                 {"search", StringLib.SafeString(search)}
    //             });
    //             SentrySdk.CaptureException(e);
    //         });
    //         return new StatusCodeResult(StatusCodes.Status500InternalServerError);
    //     }
    // }


    /// <summary>
    /// Acknowledge a report case
    /// </summary>
    /// <param name="id">id of tag</param>
    /// <response code="200">ReportContentCase Acknowledged Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpPatch("{id}/acknowledge")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<Models.ReportContentCase>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> AcknowledgeCase(string id)
    {
        try
        {
            _logger.LogInformation("Acknowledging case: " + id);
            var contentCase = await _reportContentCaseService.Acknowledge(new Domains.AcknowledgeContentReportInput
            {
                AdminId = CurrentAdmin.GetCurrentAdmin(HttpContext.User.Identity as ClaimsIdentity).Id,
                ReportContentCaseId = id
            });

            return new ObjectResult(new GetEntityResponse<ReportContentCase>(contentCase, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to acknowledge case. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Acknowledge Case"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Resolve a report case
    /// </summary>
    /// <param name="id">id of case</param>
    /// <param name="input">input of resolver</param>
    /// <response code="200">ReportContentCase Resolved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [Authorize(Policy = "Admin")]
    [HttpPatch("{id}/resolve")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<Models.ReportContentCase>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> ResolveCase(string id, [FromBody] DTOs.ResolveContentReportInput input)
    {
        try
        {
            _logger.LogInformation("Resolving case: " + id);
            var contentCase = await _reportContentCaseService.Resolve(new Domains.ResolveContentReportInput
            {
                AdminId = CurrentAdmin.GetCurrentAdmin(HttpContext.User.Identity as ClaimsIdentity).Id,
                ReportContentCaseId = id,
                Message = input.Message
            });

            return new ObjectResult(new GetEntityResponse<Models.ReportContentCase>(contentCase, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to resolve case. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Resolve case"},
                    {"id", id},
                    {"message", input.Message}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

}
