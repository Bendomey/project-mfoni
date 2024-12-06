
using main.Configurations;
using main.Configuratons;
using main.Models;
using main.DTOs;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Lib;

public class WaitlistService
{
    private readonly ILogger<WaitlistService> _logger;
    private readonly IMongoCollection<Waitlist> _waitlistCollection;
    private readonly AppConstants _appConstantsConfiguration;

    public WaitlistService(ILogger<WaitlistService> logger, DatabaseSettings databaseSettings, IOptions<AppConstants> appConstants)
    {
        this._logger = logger;
        this._waitlistCollection = databaseSettings.Database.GetCollection<Waitlist>(appConstants.Value.WaitlistCollection);
        this._appConstantsConfiguration = appConstants.Value;
    }

    public async Task<Waitlist> SaveWaitlistDetails(CreateWaitlistInput entry)
    {
        this._logger.LogInformation("Adding waitlist entry into database.");
        var normalizedPhoneNumber = StringLib.NormalizePhoneNumber(entry.PhoneNumber);

        var filter = Builders<Waitlist>.Filter.Eq(existing => existing.PhoneNumber, normalizedPhoneNumber);
        var existingEntry = await this._waitlistCollection.Find(filter).FirstOrDefaultAsync();
        if (existingEntry is not null)
        {
            // if they already exist, return old record!
            return existingEntry;
        }

        var __waitlist = new Waitlist
        {
            Name = entry.Name,
            PhoneNumber = normalizedPhoneNumber,
            Email = entry.Email,
            Type = entry.UserType
        };

        await _waitlistCollection.InsertOneAsync(__waitlist);

        if (entry.Email is not null)
        {
            var _ = EmailConfiguration.Send(new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = entry.Email,
                Subject = EmailTemplates.WaitlistSubject,
                Message = EmailTemplates.WaitlistBody,
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }

        return __waitlist;
    }
}