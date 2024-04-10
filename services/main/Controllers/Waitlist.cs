
using main.Domains.WaitlistMngmt;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace main.Controllers;

[ApiController]
[Route("api/v1/waitlists")]
public class WaitlistController : ControllerBase
{
    private readonly ILogger<WaitlistController> logger;
    private readonly IWaitlistService waitlistService;

    public WaitlistController(ILogger<WaitlistController> logger, IWaitlistService waitlistService)
    {
        this.logger = logger;
        this.waitlistService = waitlistService;
    }

    [HttpPost]
    public async Task<ActionResult> AddWaitlistUser([FromBody] CreateWaitlistInput waitlistEntry)
    {
        try
        {
            var waitlist = await waitlistService.SaveWaitlistDetails(waitlistEntry);
            return Ok(new GetEntityResponse<Models.Waitlist>(waitlist, null).Result());

        }
        catch (HttpRequestException e)
        {
            return BadRequest(new GetEntityResponse<Models.Waitlist>(null, e.Message).Result());
        }
        catch (Exception e)
        {
            this.logger.LogError($"Failed to save waitlist entry into database. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }
}