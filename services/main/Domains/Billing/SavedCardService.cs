using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;


namespace main.Domains;

public class SavedCardService
{
    private readonly ILogger<SavedCardService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.SavedCard> _savedCardCollection;

    public SavedCardService(ILogger<SavedCardService> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;

        var database = databaseConfig.Database;
        _savedCardCollection = database.GetCollection<Models.SavedCard>(appConstants.Value.SavedCardCollection);
    }

    public async Task<Models.SavedCard> GetById(string id)
    {
        var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.Id, id);
        var card = await _savedCardCollection.Find(filter).FirstOrDefaultAsync();

        if (card is null)
        {
            throw new Exception("SavedCardNotFound");
        }

        return card;
    }

    public async Task Remove(string id)
    {
        var savedCard = await GetById(id);
        // TODO: call paystack to invalidate the auth_code.

        var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.Id, id);
        var result = await _savedCardCollection.DeleteOneAsync(filter);

        if (result.DeletedCount == 0)
        {
            throw new Exception("SavedCardNotFound");
        }
    }
}