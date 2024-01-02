using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;

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

    [HttpPost]
    public OutputResponse<List<OutputContent>> Save(SaveMedia[] mediaInput)
    {
        var contents = _indexContentService.Save(mediaInput);

        var res = contents.Select(content => {
            var outputContent = new GetOutputContent(content);
            return outputContent.Result();
        }).ToList();
        return new GetEntityResponse<List<OutputContent>>(res, null).Result();
    }

    [HttpGet()]
    public OutputResponse<bool> Get()
    {
        _logger.LogInformation("Getting media");
        return new GetEntityResponse<bool>(true, null).Result();
    }

    [HttpGet("search/visual")]
    public async Task<OutputResponse<List<OutputContent>>> VisualSearch([FromForm] IFormFile media)
    {
        _logger.LogInformation("Getting contents by visual search");

        byte[] imageBytes;
        using (var memoryStream = new MemoryStream())
        {
            await media.CopyToAsync(memoryStream);
            imageBytes = memoryStream.ToArray();
        }
        var contents = await _searchContentService.VisualSearch(imageBytes);

        var res = contents.Select(content => {
            var outputContent = new GetOutputContent(content);
            return outputContent.Result();
        }).ToList();

        return new GetEntityResponse<List<OutputContent>>(res, null).Result();
    }

    [HttpGet("search/textual")]
    public async Task<OutputResponse<List<OutputContent>>> TextualSearch([FromBody] TextualSearchBody body)
    {
        _logger.LogInformation("Getting contents by textual search");

        var contents = await _searchContentService.TextualSearch(body.Query);

        var res = contents.Select(content => {
            var outputContent = new GetOutputContent(content);
            return outputContent.Result();
        }).ToList();

        return new GetEntityResponse<List<OutputContent>>(res, null).Result();
    }
}
