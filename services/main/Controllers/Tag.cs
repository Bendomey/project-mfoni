using Microsoft.AspNetCore.Mvc;
using main.Domains;
using main.DTOs;

namespace main.Controllers;

[ApiController]
[Route("api/v1/tags")]
public class TagsController : ControllerBase
{
    private readonly ILogger<MediaController> _logger;
    private readonly SaveTags _saveTagsService;
    private readonly SearchTag _searchTagsService;

    public TagsController(ILogger<MediaController> logger, SaveTags saveTagsService, SearchTag searchTagService)
    {
        _logger = logger;
        _saveTagsService = saveTagsService;
        _searchTagsService = searchTagService;
    }

    [HttpPost]
    public OutputResponse<Models.Tag> Create([FromBody] CreateTagInput input)
    {
        _logger.LogInformation("Saving tag: " + input);
        var tag = _saveTagsService.Create(input);

        return new GetEntityResponse<Models.Tag>(tag, null).Result();
    }

    [HttpGet("{id}")]
    public async Task<OutputResponse<Models.Tag>> Get(string id)
    {
        _logger.LogInformation("Getting tag: " + id);
        var tag = await _searchTagsService.Get(id);

        if (tag == null)
        {
            _logger.LogInformation("Tag not found: " + id);
            return new GetEntityResponse<Models.Tag>(null, "TagNotFound").Result();
        }

        return new GetEntityResponse<Models.Tag>(tag, null).Result();
    }

    [HttpGet]
    public async Task<OutputResponse<List<Models.Tag>>> GetAll()
    {
        _logger.LogInformation("Getting all tags");
        var tags = await _searchTagsService.GetAll();

        return new GetEntityResponse<List<Models.Tag>>(tags, null).Result();
    }

}
