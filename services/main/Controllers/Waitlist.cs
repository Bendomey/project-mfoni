
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace main.Controllers;

public class WaitlistController : ControllerBase
{
    private readonly ILogger<WaitlistController> logger;
    private readonly WaitlistService waitlistService;

    public WaitlistController(ILogger<WaitlistController> logger, WaitlistService waitlistService)
    {
        this.logger = logger;
        this.waitlistService = waitlistService;
    }

    [HttpPost("create")]
    public async Task<ActionResult> AddWaitlistUser([FromBody] WaitlistEntry waitlistEntry)
    {
        try
        {
            await this.waitlistService.SaveWaitlistDetails(waitlistEntry);
            return this.Ok();
        } 
        catch (Exception e)
        {
            this.logger.LogError($"Failed to save waitlist entry into database. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }
}