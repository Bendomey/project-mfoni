
using System.Net;
using main.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace main.Controllers;

[ApiController]
[Route("api/v1/waitlists")]
public class WaitlistController : ControllerBase
{
    private readonly ILogger<WaitlistController> logger;
    private readonly WaitlistService waitlistService;

    public WaitlistController(ILogger<WaitlistController> logger, WaitlistService waitlistService)
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
            return new ObjectResult(new GetEntityResponse<Models.Waitlist>(waitlist, null).Result()) { StatusCode = StatusCodes.Status201Created };

        }
        catch (HttpRequestException e)
        {
            var statusCode = HttpStatusCode.BadRequest;
            if (e.StatusCode != null)
            {
                statusCode = (HttpStatusCode)e.StatusCode;
            }

            return new ObjectResult(new GetEntityResponse<Models.Waitlist>(null, e.Message).Result()) { StatusCode = (int)statusCode };
        }
        catch (Exception e)
        {
            this.logger.LogError($"Failed to save waitlist entry into database. Exception: {e}");
            return new StatusCodeResult(500);
        }
    }
}