
using main.Configurations;
using main.Configuratons;
using main.DTOs;
using MongoDB.Driver;

public class WaitlistService
{
    private readonly ILogger<WaitlistService> logger;
    private readonly IMongoCollection<WaitlistEntry> database;

    public WaitlistService(ILogger<WaitlistService> logger, DatabaseSettings databaseSettings)
    {
        this.logger = logger;
        this.database = databaseSettings.Database.GetCollection<WaitlistEntry>(DataBaseCollectionConstants.WaitlistCollectionName);
    }

    public async Task SaveWaitlistDetails(WaitlistEntry entry)
    {
        this.logger.LogInformation("Adding waitlist entry into database.");

        var filter = Builders<WaitlistEntry>.Filter.Eq(existing => existing.Email, entry.Email);
        var existingEntry = await this.database.Find(filter).FirstOrDefaultAsync();
        if (existingEntry is not null){
            Console.WriteLine(existingEntry);
            throw new Exception("Entry already exists.");
        }
        await this.database.InsertOneAsync(entry);
    }
}