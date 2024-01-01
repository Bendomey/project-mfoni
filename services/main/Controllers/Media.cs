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
    public List<OutputContent> Save(SaveMedia[] mediaInput)
    {
        var contents = _indexContentService.Save(mediaInput);

        return contents.Select(content => {
            var outputContent = new GetOutputContent(content);
            return outputContent.Result();
        }).ToList();
    }

    [HttpGet()]
    public bool Get()
    {
        _logger.LogInformation("Getting media");
        return true;
    }

    [HttpGet("search/visual")]
    public async Task<List<OutputContent>> VisualSearch([FromForm] IFormFile media)
    {
        _logger.LogInformation("Getting content by visual search");

        byte[] imageBytes;
        using (var memoryStream = new MemoryStream())
        {
            await media.CopyToAsync(memoryStream);
            imageBytes = memoryStream.ToArray();
        }
        var contents = await _searchContentService.VisualSearch(imageBytes);

        return contents.Select(content => {
            var outputContent = new GetOutputContent(content);
            return outputContent.Result();
        }).ToList();
    }
}
