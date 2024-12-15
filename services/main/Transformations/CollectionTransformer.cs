

using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Lib;
using main.Models;

namespace main.Transformations;

public class CollectionTransformer
{
    private readonly UserService _userService;
    private readonly CollectionService _collectionService;
    private readonly CollectionContentService _collectionContentService;
    private readonly CollectionContentTransformer _collectionContentTransformer;
    private readonly UserTransformer _userTransformer;
    private readonly CacheProvider _cacheProvider;

    public CollectionTransformer(
       UserService userService,
       CollectionService collectionService,
       CollectionContentService collectionContentService,
       UserTransformer userTransformer,
        CollectionContentTransformer collectionContentTransformer,
        CacheProvider cacheProvider
    )
    {
        _userService = userService;
        _userTransformer = userTransformer;
        _collectionService = collectionService;
        _collectionContentService = collectionContentService;
        _collectionContentTransformer = collectionContentTransformer;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputCollection> Transform(Collection collection, string[]? populate = null, int contentItemsLimit = 0)
    {
        populate ??= Array.Empty<string>();

        OutputBasicUser? outputCreatedByUser = null;
        if (collection.CreatedById is not null && populate.Any(p => p.Contains(PopulateKeys.COLLECTION_CREATED_BY)))
        {
            var createdBy = await _cacheProvider.ResolveCache($"{CacheProvider.CacheEntities["collections"]}.{collection.CreatedById}", () => _userService.GetUserById(collection.CreatedById));
            if (createdBy is not null)
            {
                outputCreatedByUser = _userTransformer.TransformBasicUser(createdBy);
            }
        }

        List<OutputCollectionContent>? outputcollectionContents = null;
        if (contentItemsLimit > 0)
        {
            List<CollectionContent> collectionContents = await _cacheProvider.ResolveCache(
                $"{CacheProvider.CacheEntities["collections"]}.{collection.Id}.contents",
                () => _collectionContentService.GetCollectionContents(
                    new FilterQuery<Models.CollectionContent>
                    {
                        Limit = contentItemsLimit,
                        Skip = 0,
                        Populate = populate,
                    }, new GetCollectionContentsInput
                    {
                        CollectionId = collection.Id
                    })
            );

            outputcollectionContents = new List<OutputCollectionContent>();
            foreach (var collectionContent in collectionContents)
            {
                outputcollectionContents.Add(await _collectionContentTransformer.Transform(collectionContent, populate));
            }
        }

        return new OutputCollection
        {
            Id = collection.Id,
            Name = collection.Name,
            Slug = collection.Slug,
            Visibility = collection.Visibility,
            Description = collection.Description,
            CreatedById = collection.CreatedById,
            ContentsCount = collection.ContentsCount,
            CreatedByRole = collection.CreatedByRole,
            ContentItems = outputcollectionContents,
            CreatedBy = outputCreatedByUser,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
        };
    }

}