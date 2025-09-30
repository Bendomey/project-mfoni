using System.Net;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;


namespace main.Domains;

public class MfoniPackageService
{
    private readonly ILogger<MfoniPackageService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.MfoniPackage> _mfoniPackageCollection;

    public MfoniPackageService(ILogger<MfoniPackageService> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;
        var database = databaseConfig.Database;
        _mfoniPackageCollection = database.GetCollection<Models.MfoniPackage>(
            appConstants.Value.MfoniPackageCollection
        );
        _appConstantsConfiguration = appConstants.Value;
    }

    public async Task BootstrapMfoniPackages()
    {
        _logger.LogInformation("Bootsrapping mfoni packages");
        try
        {
            var alreadyExists = await _mfoniPackageCollection.Find(new BsonDocument()).FirstOrDefaultAsync();

            if (alreadyExists is not null)
            {
                _logger.LogInformation("Mfoni Packages Already Bootstrapped!");
                return;
            }

            var defaultPackages = new List<Models.MfoniPackage>
            {
                new Models.MfoniPackage
                {
                    Amount = 0,
                    Currency = "GHS",
                    Code = Models.MfoniPackageCode.FREE,
                    Name = "Snap & Share",
                    Alias = "Free tier",
                    Description = "Starter plan with free uploads",
                    Status = Models.MfoniPackageStatus.ACTIVE,
                    Features = new List<Models.MfoniPackageFeature>{
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.UPLOAD_LIMIT,
                            Name = "Max image uploads per month",
                            Description = "Upload up to 10 images per month",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "10"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PRICE_IMAGES,
                            Name = "Can price images",
                            Description = "All uploaded images are free for users",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = false.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PORTFOLIO_CUSTOM,
                            Name = "Portfolio customization",
                            Description = "Basic one-page portfolio site",
                            Type = MfoniPackageFeatureType.LEVEL,
                            Value = "none"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.CONTENT_ON_PORTFOLIO,
                            Name = "Content on portfolio",
                            Description = "Show up to 10 free content pieces on your portfolio",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "10"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.CONTACT_LINKS,
                            Name = "Show contact & social",
                            Description = "",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = false.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.EARNINGS_ANALYTICS,
                            Name = "Earnings analytics",
                            Description = "",
                            Type = MfoniPackageFeatureType.LEVEL,
                            Value = "none"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.WITHDRAWAL_LIMIT,
                            Name = "Max withdrawal per month",
                            Description = "",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "0"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PRIORITY_ADS,
                            Name = "Priority advertising",
                            Description = "",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = false.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.EARLY_ACCESS_TO_FEATURES,
                            Name = "Early feature access",
                            Description = "",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = false.ToString()
                        },
                    }

                },

                new Models.MfoniPackage
                {
                    Amount = 5000,
                    Currency = "GHS",
                    Code = Models.MfoniPackageCode.BASIC,
                    Name = "Pro Lens",
                    Alias = "Basic Premium tier",
                    Description = "Business growth plan",
                    Status = Models.MfoniPackageStatus.ACTIVE,
                    Features = new List<Models.MfoniPackageFeature>{
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.UPLOAD_LIMIT,
                            Name = "Max image uploads per month",
                            Description = "Upload up to 150 images per month",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "150"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PRICE_IMAGES,
                            Name = "Can price images",
                            Description = "Option to price images",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = true.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PORTFOLIO_CUSTOM,
                            Name = "Portfolio customization",
                            Description = "Enhanced one-page portfolio site",
                            Type = MfoniPackageFeatureType.LEVEL,
                            Value = "basic"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.CONTENT_ON_PORTFOLIO,
                            Name = "Content on portfolio",
                            Description = "Show unlimited content pieces on your portfolio",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "-1"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.CONTACT_LINKS,
                            Name = "Show contact & social",
                            Description = "Add contact info and social media links",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = true.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.EARNINGS_ANALYTICS,
                            Name = "Earnings analytics",
                            Description = "Track earnings with basic analytics",
                            Type = MfoniPackageFeatureType.LEVEL,
                            Value = "basic"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.WITHDRAWAL_LIMIT,
                            Name = "Max withdrawal per month",
                            Description = "Manual or automatic withdrawal of up to GHS 2,000 per month",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "200000" // in pesewas
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PRIORITY_ADS,
                            Name = "Priority advertising",
                            Description = "",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = false.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.EARLY_ACCESS_TO_FEATURES,
                            Name = "Early feature access",
                            Description = "",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = false.ToString()
                        },
                    }

                },


                new Models.MfoniPackage
                {
                    Amount = 10000,
                    Currency = "GHS",
                    Code = Models.MfoniPackageCode.ADVANCED,
                    Name = "Master Shot",
                    Alias = "Premium tier",
                    Description = "Advanced professional plan",
                    Status = Models.MfoniPackageStatus.ACTIVE,
                    Features = new List<Models.MfoniPackageFeature>{
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.UPLOAD_LIMIT,
                            Name = "Max image uploads per month",
                            Description = "Unlimited image uploads",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "-1"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PRICE_IMAGES,
                            Name = "Full pricing control on all images",
                            Description = "Option to price images",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = true.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PORTFOLIO_CUSTOM,
                            Name = "Portfolio customization",
                            Description = "Multi-page portfolio site with advanced customisation options",
                            Type = MfoniPackageFeatureType.LEVEL,
                            Value = "advanced"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.CONTENT_ON_PORTFOLIO,
                            Name = "Content on portfolio",
                            Description = "Show unlimited content pieces on your portfolio",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "-1"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.CONTACT_LINKS,
                            Name = "Show contact & social",
                            Description = "Add contact info and social media links",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = true.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.EARNINGS_ANALYTICS,
                            Name = "Earnings analytics",
                            Description = "Advanced earnings analytics and insights",
                            Type = MfoniPackageFeatureType.LEVEL,
                            Value = "advanced"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.WITHDRAWAL_LIMIT,
                            Name = "Max withdrawal per month",
                            Description = "Unlimited manual or automatic withdrawals",
                            Type = MfoniPackageFeatureType.LIMIT,
                            Value = "-1"
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.PRIORITY_ADS,
                            Name = "Priority advertising",
                            Description = "Priority advertising on mfoni platform",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = true.ToString()
                        },
                        new Models.MfoniPackageFeature
                        {
                            Code = MfoniPackageFeatureCode.EARLY_ACCESS_TO_FEATURES,
                            Name = "Early feature access",
                            Description = "Early access to new features",
                            Type = MfoniPackageFeatureType.BOOLEAN,
                            Value = true.ToString()
                        },
                    }

                },
            };

            await _mfoniPackageCollection.InsertManyAsync(defaultPackages);
            _logger.LogInformation("Mfoni Packages Bootstrapped now!");

            return;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bootstrapping mfoni packages");
            throw;
        }
    }


    public async Task<Models.MfoniPackage> GetByCode(string code)
    {
        var filter = Builders<Models.MfoniPackage>.Filter.Eq(p => p.Code, code);
        var package = await _mfoniPackageCollection.Find(filter).FirstOrDefaultAsync();

        if (package is null)
        {
            throw new HttpRequestException(
              "MfoniPackageNotFound",
              inner: default,
              statusCode: HttpStatusCode.NotFound
            );
        }

        return package;
    }

    public async Task<Models.MfoniPackage> GetById(string id)
    {
        var filter = Builders<Models.MfoniPackage>.Filter.Eq(p => p.Id, id);
        var package = await _mfoniPackageCollection.Find(filter).FirstOrDefaultAsync();

        if (package is null)
        {
            throw new HttpRequestException(
              "MfoniPackageNotFound",
              inner: default,
              statusCode: HttpStatusCode.NotFound
            );
        }

        return package;
    }

    public async Task<List<Models.MfoniPackage>> GetAll(FilterQuery<Models.MfoniPackage> queryFilter, string? status = "")
    {
        FilterDefinitionBuilder<Models.MfoniPackage> builder = Builders<Models.MfoniPackage>.Filter;
        var filter = Builders<Models.MfoniPackage>.Filter.Empty;

        if (!string.IsNullOrEmpty(status) && status != "ALL")
        {
            filter = builder.Eq(p => p.Status, status);
        }

        var packages = await _mfoniPackageCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return packages ?? [];
    }

    public async Task<long> Count(string? status = "")
    {
        FilterDefinitionBuilder<Models.MfoniPackage> builder = Builders<Models.MfoniPackage>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrEmpty(status) && status != "ALL")
        {
            filter = builder.Eq(p => p.Status, status);
        }

        var packagesCount = await _mfoniPackageCollection.CountDocumentsAsync(filter);

        return packagesCount;
    }
}