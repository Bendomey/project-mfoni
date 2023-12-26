using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.Models;
using main.DTOs;

namespace main.Controllers;

[ApiController]
[Route("api/v1/media")]
public class MediaController : ControllerBase
{ 
    private readonly ILogger<MediaController> _logger;
    private readonly IndexContent _indexContentService;


    public MediaController(ILogger<MediaController> logger, IndexContent indexContentService)
    {
        _logger = logger;
        _indexContentService = indexContentService;
    }

    [HttpPost("")]
    public async Task<List<Content>> Save(SaveMedia[] mediaInput)
    {
        return await _indexContentService.Save(mediaInput);
    }

    [HttpGet("{id:required}")]
    public bool Get()
    {
        _logger.LogInformation("Getting media");
        return true;
    }

    [HttpPatch("{id:required}")]
    public bool Edit()
    {
        _logger.LogInformation("Getting media");
        return true;
    }

    [HttpDelete("{id:required}")]
    public bool Delete()
    {
        _logger.LogInformation("Getting media");
        return true;
    }
}
