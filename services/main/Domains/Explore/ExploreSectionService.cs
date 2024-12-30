using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Domains;

public class ExploreSectionService
{
    private readonly ILogger<ExploreSectionService> _logger;
    private readonly IMongoCollection<Models.ExploreSection> _exploreSectionsCollection;
    private readonly CacheProvider _cacheProvider;

    public ExploreSectionService(
       ILogger<ExploreSectionService> logger,
       DatabaseSettings databaseConfig,
       IOptions<AppConstants> appConstants,
       CacheProvider cacheProvider
   )
    {
        _logger = logger;

        var database = databaseConfig.Database;

        _exploreSectionsCollection = database.GetCollection<Models.ExploreSection>(appConstants.Value.ExploreSectionCollection);

        _cacheProvider = cacheProvider;

        _logger.LogDebug("ExploreSectionService initialized");
    }

    public async Task<Models.ExploreSection> Create(CreateExploreSection input)
    {

        var oldExploreSection = await _exploreSectionsCollection.Find(exploreSection => exploreSection.Title.ToLower() == input.Title.ToLower()).FirstOrDefaultAsync();

        if (oldExploreSection is not null)
        {
            throw new HttpRequestException("ExploreSectionAlreadyExists");
        }

        var countOfSections = await _exploreSectionsCollection.CountDocumentsAsync(_ => true);

        var exploreSection = new Models.ExploreSection
        {
            Endpoint = input.Endpoint,
            SeeMorePathname = input.SeeMorePathname,
            Title = input.Title,
            Type = input.Type,
            Sort = (int)countOfSections + 1,
        };

        if (input.EnsureAuth is not null)
        {
            exploreSection.EnsureAuth = (bool)input.EnsureAuth;
        }

        if (input.Visibility is not null)
        {
            exploreSection.Visibility = (string)input.Visibility;
        }

        await _exploreSectionsCollection.InsertOneAsync(exploreSection);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["explore"]}.find*",
        });

        return exploreSection;
    }

    public async Task<List<Models.ExploreSection>> GetSections(
        FilterQuery<Models.ExploreSection> queryFilter
    )
    {
        FilterDefinitionBuilder<Models.ExploreSection> builder = Builders<Models.ExploreSection>.Filter;
        var filter = builder.Eq(r => r.Visibility, ExploreSectionVisibility.PUBLIC);

        var sections = await _exploreSectionsCollection
            .Find(filter)
            .Skip(queryFilter.Skip)
            .Limit(queryFilter.Limit)
            .Sort(queryFilter.Sort)
            .ToListAsync();

        return sections ?? [];
    }

    public async Task<long> CountSections()
    {
        FilterDefinitionBuilder<Models.ExploreSection> builder = Builders<Models.ExploreSection>.Filter;
        var filter = builder.Eq(r => r.Visibility, ExploreSectionVisibility.PUBLIC);
        var count = await _exploreSectionsCollection.CountDocumentsAsync(filter);

        return count;
    }

    public async Task ResolveExploreSection(CreateExploreSection input)
    {
        var oldExploreSection = await _exploreSectionsCollection.Find(exploreSection => exploreSection.Title.ToLower() == input.Title.ToLower()).FirstOrDefaultAsync();

        if (oldExploreSection is not null)
        {
            return;
        }

        await Create(input);
    }

    public async Task BootstrapExploreSections()
    {
        _logger.LogInformation("Bootsrapping explore sections now!");
        CreateExploreSection[] sections = {
            new CreateExploreSection
            {
                Title = "Featured Images",
                Endpoint = "/api/v1/collections/featured_contents",
                Type = ExploreSectionType.CONTENT,
                SeeMorePathname = "/explore/contents?type=image&featured=true",
                Visibility = ExploreSectionVisibility.PUBLIC,
            },
            new CreateExploreSection
            {
                Title = "Featured Collections",
                Endpoint = "/api/v1/collections/featured_collections",
                Type = ExploreSectionType.COLLECTION,
                SeeMorePathname = "/explore/collections?featured=true",
                Visibility = ExploreSectionVisibility.PUBLIC,
            },
            new CreateExploreSection
            {
                Title = "Featured Tags",
                Endpoint = "/api/v1/collections/featured_tags",
                Type = ExploreSectionType.TAG,
                SeeMorePathname = "/explore/tags?featured=true",
                Visibility = ExploreSectionVisibility.PUBLIC,
            },
            new CreateExploreSection
            {
                Title = "Featured Creators",
                Endpoint = "/api/v1/collections/featured_creators",
                Type = ExploreSectionType.CREATOR,
                SeeMorePathname = "/explore/creators?featured=true",
                Visibility = ExploreSectionVisibility.PUBLIC,
            },
            new CreateExploreSection
            {
                Title = "Trending Collections",
                Endpoint = "/api/v1/collections/trending_collections",
                Type = ExploreSectionType.COLLECTION,
                SeeMorePathname = "/explore/collections?trending=true",
                Visibility = ExploreSectionVisibility.PUBLIC,
            },
            new CreateExploreSection
            {
                Title = "Popular Tags",
                Endpoint = "/api/v1/collections/popular_tags",
                Type = ExploreSectionType.TAG,
                SeeMorePathname = "/explore/tags?popular=true",
                Visibility = ExploreSectionVisibility.PUBLIC,
            },
            new CreateExploreSection
            {
                Title = "Your Followings",
                Endpoint = "/api/v1/followings",
                Type = ExploreSectionType.CREATOR,
                EnsureAuth = true,
                SeeMorePathname = "/account/followings",
                Visibility = ExploreSectionVisibility.PUBLIC,
            },

        };

        foreach (var section in sections)
        {
            await ResolveExploreSection(section);
        }
        _logger.LogInformation("ExploreSections Bootstrapped now!");

    }
}