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
    private readonly IMongoCollection<Models.User> _usersCollection;
    private readonly IMongoCollection<CreatorApplication> _creatorApplicationsCollection;

    public SearchAdmin(DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        var database = databaseConfig.Database;
        _adminsCollection = database.GetCollection<Models.Admin>(
            appConstants.Value.AdminCollection
        );
        _usersCollection = database.GetCollection<Models.User>(appConstants.Value.UserCollection);
        _creatorApplicationsCollection = database.GetCollection<CreatorApplication>(
            appConstants.Value.CreatorApplicatonCollection
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

        long adminsCount = await _adminsCollection.CountDocumentsAsync(filter);

        return admins ?? [];
    }

    public async Task<long> CountAdmins(FilterQuery<Models.Admin> queryFilter, string? query)
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

    public async Task<List<Models.User>> GetUsers(
        FilterQuery<Models.User> queryFilter,
        string? status,
        string? role,
        string? provider,
        string? query
    )
    {
        FilterDefinitionBuilder<Models.User> builder = Builders<Models.User>.Filter;
        var filter = builder.Empty;
        List<string> filters = ["status", "role", "provider", "name"];

        List<string> filterValues = [status, role, provider, query];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);

        var users = await _usersCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return users ?? [];
    }

    public async Task<long> CountUsers(
        FilterQuery<Models.User> queryFilter,
        string? status,
        string? role,
        string? provider,
        string? query
    )
    {
        FilterDefinitionBuilder<Models.User> builder = Builders<Models.User>.Filter;
        var filter = builder.Empty;
        List<string> filters = ["status", "role", "provider", "name"];

        List<string> filterValues = [status, role, provider, query];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);

        long usersCount = await _usersCollection.CountDocumentsAsync(filter);
        return usersCount;
    }

    public async Task<List<CreatorApplication>> GetCreators(
        FilterQuery<CreatorApplication> queryFilter,
        string? status
    )
    {
        FilterDefinitionBuilder<CreatorApplication> builder = Builders<CreatorApplication>.Filter;
        var filter = builder.Empty;

        List<string> filters = ["status"];
        List<string> filterValues = [status];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);
        var creatorApplications = await _creatorApplicationsCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return creatorApplications ?? [];
    }

    public async Task<long> CountCreators(
        FilterQuery<CreatorApplication> queryFilter,
        string? status
    )
    {
        FilterDefinitionBuilder<CreatorApplication> builder = Builders<CreatorApplication>.Filter;
        var filter = builder.Empty;

        List<string> filters = ["status"];
        List<string> filterValues = [status];

        var regexFilters = filters
            .Select(
                (field, index) =>
                    filterValues[index] != null
                        ? builder.Regex(field, new BsonRegularExpression(filterValues[index], "i"))
                        : builder.Empty
            )
            .ToList();

        filter = builder.And(regexFilters);

        long creatorApplicationsCount = await _creatorApplicationsCollection.CountDocumentsAsync(
            filter
        );
        return creatorApplicationsCount;
    }
}
