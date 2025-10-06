using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Configuratons;

public class DatabaseSettings
{
    public MongoClient Client;
    public IMongoDatabase Database;

    public DatabaseSettings(IOptions<AppConstants> appConstants)
    {
        var client = new MongoClient(appConstants.Value.DatabaseConnectionString);
        Client = client;
        Database = client.GetDatabase(appConstants.Value.DatabaseName);
    }

}

