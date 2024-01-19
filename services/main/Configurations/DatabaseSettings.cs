using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Configuratons;

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = null!;

    public string DatabaseName { get; set; } = null!;

    public static IMongoDatabase connectToDatabase(IOptions<DatabaseSettings> mfoniStoreDatabaseSettings)
    {
        var client = new MongoClient(mfoniStoreDatabaseSettings.Value.ConnectionString);
        return client.GetDatabase(mfoniStoreDatabaseSettings.Value.DatabaseName);
    }

}

