using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Configuratons;

public class DatabaseSettings
{
    public IMongoDatabase Database;

    public DatabaseSettings(IOptions<AppConstants> appConstants)
    {
        var client = new MongoClient(appConstants.Value.DatabaseConnectionString);
        Database = client.GetDatabase(appConstants.Value.DatabaseName);
    }

}

