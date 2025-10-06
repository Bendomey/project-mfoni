using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;
using System.Net;
using Microsoft.OpenApi.Any;
using main.Lib;
using main.Transformations;
using main.Models;

namespace main.Controllers;


[ApiController]
[Route("api/v1/mfoni-packages")]
public class MfoniPackagesController : ControllerBase
{
    private readonly ILogger<MfoniPackagesController> _logger;
    private readonly MfoniPackageService _mfoniPackageService;
    private readonly MfoniPackageTransformer _mfoniPackageTransformer = new MfoniPackageTransformer();

    public MfoniPackagesController(
        ILogger<MfoniPackagesController> logger,
        MfoniPackageService mfoniPackageService,
        MfoniPackageTransformer mfoniPackageTransformer
    )
    {
        _logger = logger;
        _mfoniPackageService = mfoniPackageService;
        _mfoniPackageTransformer = mfoniPackageTransformer;
    }

    /// <summary>
    /// Get package by id
    /// </summary>
    /// <param name="id">id of package</param>
    /// <response code="200">MfoniPackage Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{id}")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputMfoniPackage>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> Get(string id)
    {
        try
        {
            var package = await _mfoniPackageService.GetById(id);

            if (package == null)
            {
                throw new HttpRequestException("MfoniPackageNotFound", null, HttpStatusCode.NotFound);
            }

            var outputPackage = _mfoniPackageTransformer.Transform(package!);
            return new ObjectResult(new GetEntityResponse<OutputMfoniPackage>(outputPackage, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to get package. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get Package by id"},
                    {"id", id}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Get package by code
    /// </summary>
    /// <param name="code">code of package</param>
    /// <response code="200">MfoniPackage Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet("{code}/code")]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<OutputMfoniPackage>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetByCode(string code)
    {
        try
        {
            var package = await _mfoniPackageService.GetByCode(code);

            if (package == null)
            {
                throw new HttpRequestException("MfoniPackageNotFound", null, HttpStatusCode.NotFound);
            }

            var outputPackage = _mfoniPackageTransformer.Transform(package!);
            return new ObjectResult(new GetEntityResponse<OutputMfoniPackage>(outputPackage, null).Result()) { StatusCode = StatusCodes.Status200OK };
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
            this._logger.LogError($"Failed to get package. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get Package by code"},
                    {"code", code}
               });
                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves all packages on the platform
    /// </summary>
    /// <param name="status">filter by status `MfoniPackage.Status.Active` or `MfoniPackage.Status.Inactive`</param>
    /// <param name="page">The page to be navigated to</param>
    /// <param name="pageSize">The number of items on a page</param>
    /// <param name="sort">To sort response data either by `asc` or `desc`</param>
    /// <param name="sortBy">What field to sort by.</param>
    /// <response code="200">MfoniPackages Retrieved Successfully</response>
    /// <response code="500">An unexpected error occured</response>
    [HttpGet]
    [ProducesResponseType(
        StatusCodes.Status200OK,
        Type = typeof(ApiEntityResponse<EntityWithPagination<OutputMfoniPackage>>)
    )]
    [ProducesResponseType(
        StatusCodes.Status500InternalServerError,
        Type = typeof(StatusCodeResult)
    )]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sort,
        [FromQuery] string sortBy = "created_at"
    )
    {
        try
        {
            _logger.LogInformation("Getting all MfoniPackages");
            var queryFilter = HttpLib.GenerateFilterQuery<Models.MfoniPackage>(page, pageSize, sort, sortBy, "");
            var packages = await _mfoniPackageService.GetAll(queryFilter, status);
            var packagesCount = await _mfoniPackageService.Count(status);

            var outputPackages = packages.ConvertAll<OutputMfoniPackage>(
                new Converter<MfoniPackage, OutputMfoniPackage>(_mfoniPackageTransformer.Transform)
            );

            var response = HttpLib.GeneratePagination(outputPackages, packagesCount, queryFilter);
            return new ObjectResult(new GetEntityResponse<EntityWithPagination<OutputMfoniPackage>>(response, null).Result()) { StatusCode = (int)HttpStatusCode.OK };
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
            this._logger.LogError($"Failed to get packages. Exception: {e}");
            SentrySdk.ConfigureScope(scope =>
            {
                scope.SetTags(new Dictionary<string, string>
                {
                    {"action", "Get All Packages"},
                    {"page", StringLib.SafeString(page.ToString())},
                    {"pageSize", StringLib.SafeString(pageSize.ToString())},
                    {"sort", StringLib.SafeString(sort)},
                    {"sortBy", sortBy},
                    {"status", StringLib.SafeString(status)},
                });

                SentrySdk.CaptureException(e);
            });
            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }
}