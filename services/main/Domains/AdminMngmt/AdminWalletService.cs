using System.Net;
using main.Configuratons;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace main.Domains;

public class AdminWalletService
{
    private readonly ILogger<CreatorService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.AdminWallet> _adminWalletCollection;

    public AdminWalletService(ILogger<CreatorService> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;
        var database = databaseConfig.Database;
        _adminWalletCollection = database.GetCollection<Models.AdminWallet>(
            appConstants.Value.AdminWalletCollection
        );
        _appConstantsConfiguration = appConstants.Value;
    }

    public async Task<Models.AdminWallet> Get()
    {
        var adminWallet = await _adminWalletCollection.Find(new BsonDocument()).FirstOrDefaultAsync();
        if (adminWallet is null)
        {
            throw new HttpRequestException("Admin wallet not found");
        }

        return adminWallet;
    }

    public async Task BootsrapAdminWallet()
    {
        _logger.LogInformation("Bootsrapping admin wallet");
        try
        {
            var alreadyExists = await Get();

            _logger.LogInformation("Admin Wallet Already Bootstrapped!");
        }
        catch (HttpRequestException)
        {

             var newAdminWallet = new Models.AdminWallet { };

                await _adminWalletCollection.InsertOneAsync(newAdminWallet);
                _logger.LogInformation("Admin Wallet Bootstrapped now!");

                return;
        }

    }
}
