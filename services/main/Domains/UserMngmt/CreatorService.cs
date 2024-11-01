using main.Configurations;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using NanoidDotNet;

namespace main.Domains;

public class CreatorService
{
    private readonly ILogger<UserService> _logger;
    private readonly IMongoCollection<Models.Creator> __creatorCollection;
    private readonly IMongoCollection<Models.CreatorPackage> __creatorPackageCollection;

    public CreatorService(
       ILogger<UserService> logger,
       DatabaseSettings databaseConfig,
       IOptions<AppConstants> appConstants
   )
    {
        _logger = logger;
        __creatorCollection = databaseConfig.Database.GetCollection<Models.Creator>(
            appConstants.Value.CreatorCollection
        );
        __creatorPackageCollection = databaseConfig.Database.GetCollection<Models.CreatorPackage>(
           appConstants.Value.CreatorPackageCollection
       );

        logger.LogDebug("Creator service initialized");
    }

    public Models.CreatorPackage? GetCreatorPackageByCreatorId(string creatorId)
    {
        var __package = __creatorPackageCollection.Find(package => package.CreatorId == creatorId && package.Status == CreatorPackageStatus.ACTIVE).FirstOrDefault();

        if (__package is null)
        {
            throw new HttpRequestException("CreatorPackageNotFound");
        }

        return __package;
    }

}