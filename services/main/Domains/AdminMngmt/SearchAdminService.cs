using System.Net;
using main.Configuratons;
using main.Lib;
using main.Models;
using main.Transformations;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace main.Domains;

public class SearchAdmin
{
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.Admin> _adminsCollection;

    public SearchAdmin(DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        var database = databaseConfig.Database;
        _adminsCollection = database.GetCollection<Models.Admin>(
            appConstants.Value.AdminCollection
        );
        _appConstantsConfiguration = appConstants.Value;
    }

    public async Task<Models.Admin> Get(string id)
    {
        var admin = await _adminsCollection.Find(admin => admin.Id == id).FirstOrDefaultAsync();
        if (admin is null)
        {
            throw new HttpRequestException("Admin not found", default, HttpStatusCode.NotFound);
        }

        return admin;
    }

    public async Task<List<Models.Admin>> GetAdmins(
        FilterQuery<Models.Admin> queryFilter,
        string? query
    )
    {
        FilterDefinitionBuilder<Models.Admin> builder = Builders<Models.Admin>.Filter;
        var filter = Builders<Models.Admin>.Filter.Empty;
        if (query is not null)
        {
            filter = builder.Regex("name", new BsonRegularExpression(query, "i"));
        }

        var admins = await _adminsCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return admins ?? [];
    }

    public async Task<long> CountAdmins(string? query)
    {
        FilterDefinitionBuilder<Models.Admin> builder = Builders<Models.Admin>.Filter;
        var filter = Builders<Models.Admin>.Filter.Empty;
        if (query is not null)
        {
            filter = builder.Regex("name", new BsonRegularExpression(query, "i"));
        }

        long adminsCount = await _adminsCollection.CountDocumentsAsync(filter);

        return adminsCount;
    }
}
