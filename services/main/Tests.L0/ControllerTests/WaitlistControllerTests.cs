namespace Tests.L0;

using main.Controllers;
using main.DTOs;
using main.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

[TestClass]
public class WaitlistControllerTests
{
    private readonly MockRepository mockRepository;
    private readonly WaitlistController waitlistController;
    private readonly Mock<WaitlistService> waitlistServiceMock;

    public WaitlistControllerTests()
    {
        this.mockRepository = new MockRepository(MockBehavior.Strict);
        this.waitlistServiceMock = this.mockRepository.Create<WaitlistService>();
        this.waitlistController = new WaitlistController(NullLogger<WaitlistController>.Instance, this.waitlistServiceMock.Object);
    }

    [TestMethod]
    public async Task AddWaitlistUser_CallsWaitlistService()
    {
        var sampleRequest = new CreateWaitlistInput(){
            Name = "Nana",
            PhoneNumber = "0558829926",
            Email = "hello@gmail.com",
            UserType = "client",
        };

        this.waitlistServiceMock
            .Setup(m => m.SaveWaitlistDetails(sampleRequest))
            .ReturnsAsync(new Waitlist(){
                Name = sampleRequest.Name,
                PhoneNumber = sampleRequest.PhoneNumber,
                Type = sampleRequest.UserType,
                Email = sampleRequest.Email
            });

        var result = await this.waitlistController.AddWaitlistUser(sampleRequest);

        Assert.AreEqual(200, (result as ObjectResult)?.StatusCode);
    }
}