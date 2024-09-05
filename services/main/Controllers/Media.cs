using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using main.Middlewares;
using System.Security.Claims;
using MongoDB.Driver;
using System.Net;
using main.Transformations;

namespace main.Controllers;

[ApiController]
[Route("api/v1/contents")]
public class MediaController : ControllerBase
{
    private readonly ILogger<MediaController> _logger;
    private readonly IndexContent _indexContentService;
    private readonly SearchContent _searchContentService;

    public MediaController(ILogger<MediaController> logger, IndexContent indexContentService, SearchContent searchContentService)
    {
        _logger = logger;
        _indexContentService = indexContentService;
        _searchContentService = searchContentService;
    }

    [Authorize]
    [HttpPost]
    public IActionResult Save(SaveMedia[] mediaInput)
    {
        try
        {
            _logger.LogInformation("Saving media");
            var currentUser = CurrentUser.GetCurrentUser(HttpContext.User.Identity as ClaimsIdentity);

            var contents = _indexContentService.Save(mediaInput, currentUser);

            var res = contents.Select(content =>
            {
                var outputContent = new GetOutputContent(content);
                return outputContent.Result();
            }).ToList();

            return new ObjectResult(new GetEntityResponse<List<OutputContent>>(res, null).Result()) { StatusCode = StatusCodes.Status201Created };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<List<OutputContent>>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to save media. Exception: {e}");
            return new StatusCodeResult(500);
        }

    }

    [HttpGet]
    public OutputResponse<bool> Get()
    {
        _logger.LogInformation("Getting media");
        return new GetEntityResponse<bool>(true, null).Result();
    }

    [HttpGet("search/visual")]
    public async Task<IActionResult> VisualSearch([FromForm] IFormFile media)
    {
        try
        {
            _logger.LogInformation("Getting contents by visual search");

            byte[] imageBytes;
            using (var memoryStream = new MemoryStream())
            {
                await media.CopyToAsync(memoryStream);
                imageBytes = memoryStream.ToArray();
            }
            var contents = await _searchContentService.VisualSearch(imageBytes);

            var res = contents.Select(content =>
            {
                var outputContent = new GetOutputContent(content);
                return outputContent.Result();
            }).ToList();

            return new ObjectResult(new GetEntityResponse<List<OutputContent>>(res, null).Result()) { StatusCode = StatusCodes.Status200OK };

        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<List<OutputContent>>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get contents. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }

    [HttpGet("search/textual")]
    public async Task<IActionResult> TextualSearch([FromBody] TextualSearchBody body)
    {
        try
        {
            _logger.LogInformation("Getting contents by textual search");

            var contents = await _searchContentService.TextualSearch(body.Query);

            var res = contents.Select(content =>
            {
                var outputContent = new GetOutputContent(content);
                return outputContent.Result();
            }).ToList();

            return new ObjectResult(new GetEntityResponse<List<OutputContent>>(res, null).Result()) { StatusCode = StatusCodes.Status200OK };
        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<List<OutputContent>>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this._logger.LogError($"Failed to get contents. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }
}
