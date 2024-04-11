
using main.Configurations;
using main.Configuratons;
using main.Models;
using main.DTOs;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Domains.WaitlistMngmt;

public class WaitlistService : IWaitlistService
{
    private readonly ILogger<WaitlistService> _logger;
    private readonly IMongoCollection<Waitlist> _waitlistCollection;

    public WaitlistService(ILogger<WaitlistService> logger, DatabaseSettings databaseSettings, IOptions<AppConstants> appConstants)
    {
        this._logger = logger;
        this._waitlistCollection = databaseSettings.Database.GetCollection<Waitlist>(appConstants.Value.WaitlistCollection);
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
        return __waitlist;
    }
}