using Microsoft.Extensions.Options;
using MongoDB.Driver;
using main.Configuratons;
using main.DTOs;
using main.Lib;
using MongoDB.Bson;
using main.Models;

namespace main.Domains;

public class CollectionContentService
{
    private readonly SearchContentService _searchContentService;
    private readonly CollectionService _collectionService;
    private readonly SearchTagService _searchTagService;
    private readonly ILogger<CollectionContentService> _logger;
    private readonly IMongoCollection<Models.CollectionContent> _collectionContentCollection;
    private readonly IMongoCollection<Models.Collection> _collectionCollection;
    private readonly IMongoCollection<Models.Content> _contentCollection;
    private readonly IMongoCollection<Models.Tag> _tagCollection;
    private readonly CacheProvider _cacheProvider;
    private readonly AppConstants _appConstantsConfiguration;

    public CollectionContentService(
        ILogger<CollectionContentService> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider,
        CollectionService collectionService,
        SearchTagService searchTagService,
        SearchContentService searchContentService
    )
    {
        _logger = logger;
        _collectionContentCollection = databaseConfig.Database.GetCollection<Models.CollectionContent>(appConstants.Value.CollectionContentCollection);
        _collectionCollection = databaseConfig.Database.GetCollection<Models.Collection>(appConstants.Value.CollectionCollection);
        _contentCollection = databaseConfig.Database.GetCollection<Models.Content>(appConstants.Value.ContentCollection);
        _tagCollection = databaseConfig.Database.GetCollection<Models.Tag>(appConstants.Value.TagCollection);
        _cacheProvider = cacheProvider;
        _appConstantsConfiguration = appConstants.Value;
        _collectionService = collectionService;
        _searchTagService = searchTagService;
        _searchContentService = searchContentService;

        logger.LogDebug("Collection Content service initialized");
    }

    public Models.CollectionContent SaveCollectionContent(SaveCollectionContent input)
    {
        var collection = _collectionService.GetCollection(input.CollectionId);

        var filter = Builders<Models.CollectionContent>.Filter.Eq(r => r.CollectionId, input.CollectionId);

        if (input.TagId is not null)
        {
            var tag = _tagCollection.Find(Builders<Models.Tag>.Filter.Eq(r => r.Id, input.TagId)).FirstOrDefault();

            if (tag is null)
            {
                throw new HttpRequestException("TagNotFound");
            }

            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.TagId, input.TagId);
        }
        else if (input.ChildCollectionId is not null)
        {
            var childCollection = _collectionCollection.Find(Builders<Collection>.Filter.Eq(r => r.Id, input.ChildCollectionId)).FirstOrDefault();

            if (childCollection is null)
            {
                throw new HttpRequestException("ChildCollectionNotFound");
            }

            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ChildCollectionId, input.ChildCollectionId);
        }
        else if (input.ContentId is not null)
        {
            var content = _contentCollection.Find(Builders<Content>.Filter.Eq(r => r.Id, input.ContentId)).FirstOrDefault();

            if (content is null)
            {
                throw new HttpRequestException("ContentNotFound");
            }

            filter &= Builders<Models.CollectionContent>.Filter.Eq(r => r.ContentId, input.ContentId);
        }

        var oldCollectionContent = _collectionContentCollection.Find(filter).FirstOrDefault();

        if (oldCollectionContent is not null)
        {
            throw new HttpRequestException("CollectionContentAlreadyExists");
        }

        var collectionContent = new Models.CollectionContent
        {
            CollectionId = input.CollectionId,
            Type = input.Type,
            ContentId = input.ContentId,
            TagId = input.TagId,
            ChildCollectionId = input.ChildCollectionId
        };

        _collectionContentCollection.InsertOne(collectionContent);

        _collectionService.UpdateCollectionContentsCount(input.CollectionId, 1);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Id}*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Slug}*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Name}*",
            $"{CacheProvider.CacheEntities["collections"]}*contents*",
        });

        return collectionContent;
    }

    public Models.CollectionContent GetCollection(string collectionId)
    {
        var collectionContent = _collectionContentCollection.Find(collection => collection.Id == collectionId).FirstOrDefault();
        if (collectionContent is null)
        {
            throw new HttpRequestException("CollectionContentNotFound");
        }

        return collectionContent;
    }

    public async Task<List<Models.CollectionContent>> GetCollectionContents(
        FilterQuery<Models.CollectionContent> queryFilter,
        GetCollectionContentsInput input
    )
    {
        var pipeline = new BsonDocument[]
        {
        };

        if (input.CollectionId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "collection_id", new BsonDocument("$eq", ObjectId.Parse(input.CollectionId)) },
                })
            ).ToArray();
        }

        if (input.TagId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "tag_id", new BsonDocument("$eq", ObjectId.Parse(input.TagId)) },
                })
            ).ToArray();
        }

        if (input.ChildCollectionId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "child_collection_id", new BsonDocument("$eq", ObjectId.Parse(input.ChildCollectionId)) },
                })
            ).ToArray();
        }

        if (input.ContentId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "content_id", new BsonDocument("$eq", ObjectId.Parse(input.ContentId)) },
                })
            ).ToArray();
        }

        // FOR CONTENT
        pipeline = pipeline.Append(
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "contents" },
                { "localField", "content_id" },
                { "foreignField", "_id" },
                { "as", "content" }
            })
        ).ToArray();

        pipeline = pipeline.Append(
            new BsonDocument("$unwind",
                new BsonDocument
                {
                    { "path", "$content" },
                    { "preserveNullAndEmptyArrays", true }
                }
            )
        ).ToArray();

        if (input.Visibility != null && input.Visibility != "ALL")
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument("$or",
                    new BsonArray
                    {
                        new BsonDocument("content_id", new BsonDocument("$exists", true)),
                        new BsonDocument("content_id", new BsonDocument("$ne", null)),
                        new BsonDocument
                        {
                            new BsonDocument("content", new BsonDocument("$type", "object")),
                            new BsonDocument("content.visibility", new BsonDocument("$eq", input.Visibility))
                        }
                    })
                )
            ).ToArray();
        }

        if (input.Orientation != null && input.Orientation != "ALL")
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument("$or",
                    new BsonArray
                    {
                        new BsonDocument("content_id", new BsonDocument("$exists", true)),
                        new BsonDocument("content_id", new BsonDocument("$ne", null)),
                        new BsonDocument
                        {
                            new BsonDocument("content", new BsonDocument("$type", "object")),
                            new BsonDocument("content.orientation", new BsonDocument("$eq", input.Orientation))
                        }
                    })
                )
            ).ToArray();
        }

        // FOR CHILD COLLECTION
        //     pipeline = pipeline.Append(
        //        new BsonDocument("$lookup", new BsonDocument
        //        {
        //             { "from", "collections" },
        //             { "localField", "child_collection_id" },
        //             { "foreignField", "_id" },
        //             { "as", "child_collection" }
        //        })
        //    ).ToArray();

        //     pipeline = pipeline.Append(
        //         new BsonDocument("$unwind",
        //             new BsonDocument
        //             {
        //                 { "path", "$child_collection" },
        //                 { "preserveNullAndEmptyArrays", true }
        //             }
        //         )
        //     ).ToArray();

        // if (input.Visibility != null && input.Visibility != "ALL")
        // {
        //     pipeline = pipeline.Append(
        //         new BsonDocument("$match", new BsonDocument("$or",
        //             new BsonArray
        //             {
        //                 new BsonDocument("child_collection_id", new BsonDocument("$exists", true)),
        //                 new BsonDocument("child_collection_id", new BsonDocument("$ne", null)),
        //                 new BsonDocument
        //                 {
        //                     new BsonDocument("child_collection", new BsonDocument("$type", "object")),
        //                     new BsonDocument("child_collection.visibility", new BsonDocument("$eq", input.Visibility))
        //                 }
        //             })
        //         )
        //     ).ToArray();
        // }

        pipeline = pipeline.Append(new BsonDocument("$project", new BsonDocument("content", 0))).ToArray();
        pipeline = pipeline.Append(new BsonDocument("$limit", queryFilter.Limit)).ToArray();
        pipeline = pipeline.Append(new BsonDocument("$skip", queryFilter.Skip)).ToArray();

        // TODO: figure out how to sort dynamically
        pipeline = pipeline.Append(new BsonDocument("$sort", new BsonDocument("created_at", -1))).ToArray();

        return await _collectionContentCollection
           .Aggregate<Models.CollectionContent>(pipeline)
           .ToListAsync();
    }

    public async Task<long> CountCollectionContents(GetCollectionContentsInput input)
    {
        var pipeline = new BsonDocument[]
       {
       };

        if (input.CollectionId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "collection_id", new BsonDocument("$eq", ObjectId.Parse(input.CollectionId)) },
                })
            ).ToArray();
        }

        if (input.TagId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "tag_id", new BsonDocument("$eq", ObjectId.Parse(input.TagId)) },
                })
            ).ToArray();
        }

        if (input.ChildCollectionId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "child_collection_id", new BsonDocument("$eq", ObjectId.Parse(input.ChildCollectionId)) },
                })
            ).ToArray();
        }

        if (input.ContentId != null)
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument
                {
                    { "content_id", new BsonDocument("$eq", ObjectId.Parse(input.ContentId)) },
                })
            ).ToArray();
        }

        // FOR CONTENT
        pipeline = pipeline.Append(
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "contents" },
                { "localField", "content_id" },
                { "foreignField", "_id" },
                { "as", "content" }
            })
        ).ToArray();

        pipeline = pipeline.Append(
            new BsonDocument("$unwind",
                new BsonDocument
                {
                    { "path", "$content" },
                    { "preserveNullAndEmptyArrays", true }
                }
            )
        ).ToArray();

        if (input.Visibility != null && input.Visibility != "ALL")
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument("$or",
                    new BsonArray
                    {
                        new BsonDocument("content_id", new BsonDocument("$exists", true)),
                        new BsonDocument("content_id", new BsonDocument("$ne", null)),
                        new BsonDocument
                        {
                            new BsonDocument("content", new BsonDocument("$type", "object")),
                            new BsonDocument("content.visibility", new BsonDocument("$eq", input.Visibility))
                        }
                    })
                )
            ).ToArray();
        }

        if (input.Orientation != null && input.Orientation != "ALL")
        {
            pipeline = pipeline.Append(
                new BsonDocument("$match", new BsonDocument("$or",
                    new BsonArray
                    {
                        new BsonDocument("content_id", new BsonDocument("$exists", true)),
                        new BsonDocument("content_id", new BsonDocument("$ne", null)),
                        new BsonDocument
                        {
                            new BsonDocument("content", new BsonDocument("$type", "object")),
                            new BsonDocument("content.orientation", new BsonDocument("$eq", input.Orientation))
                        }
                    })
                )
            ).ToArray();
        }

        //     // FOR CHILD COLLECTION
        //     pipeline = pipeline.Append(
        //        new BsonDocument("$lookup", new BsonDocument
        //        {
        //             { "from", "collections" },
        //             { "localField", "child_collection_id" },
        //             { "foreignField", "_id" },
        //             { "as", "child_collection" }
        //        })
        //    ).ToArray();

        //     pipeline = pipeline.Append(
        //         new BsonDocument("$unwind",
        //             new BsonDocument
        //             {
        //                 { "path", "$child_collection" },
        //                 { "preserveNullAndEmptyArrays", true }
        //             }
        //         )
        //     ).ToArray();

        //     if (input.Visibility != null && input.Visibility != "ALL")
        //     {
        //         pipeline = pipeline.Append(
        //             new BsonDocument("$match", new BsonDocument("$or",
        //                 new BsonArray
        //                 {
        //                     new BsonDocument("child_collection_id", new BsonDocument("$exists", true)),
        //                     new BsonDocument("child_collection_id", new BsonDocument("$ne", null)),
        //                     new BsonDocument
        //                     {
        //                         new BsonDocument("child_collection", new BsonDocument("$type", "object")),
        //                         new BsonDocument("child_collection.visibility", new BsonDocument("$eq", input.Visibility))
        //                     }
        //                 })
        //             )
        //         ).ToArray();
        //     }


        pipeline = pipeline.Append(new BsonDocument("$project", new BsonDocument("content", 0))).ToArray();
        pipeline = pipeline.Append(new BsonDocument("$count", "totalCount")).ToArray();

        var result = await _collectionContentCollection.AggregateAsync<MongoAggregationGetCount>(pipeline);

        var count = 0;
        await result.ForEachAsync(doc =>
        {
            count = doc.TotalCount;
        });

        return count;
    }

    public List<CollectionContent> AddContentsToCollection(AddContentsToCollectionInput input)
    {
        var filter = Builders<Models.Collection>.Filter.Eq(r => r.Id, input.Id);
        if (input.UserId is not null)
        {
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedById, input.UserId);
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedByRole, CollectionCreatedByRole.USER);
        }
        else
        {
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedByRole, CollectionCreatedByRole.SYSTEM);
        }

        var oldCollection = _collectionCollection.Find(filter).FirstOrDefault();
        if (oldCollection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        var collectionContents = new List<CollectionContent>();

        foreach (var contentId in input.ContentIds)
        {

            try
            {
                var collectionContent = SaveCollectionContent(new SaveCollectionContent
                {
                    CollectionId = input.Id,
                    ContentId = contentId.Type == CollectionContentType.CONTENT ? contentId.Id : null,
                    Type = contentId.Type,
                    TagId = contentId.Type == CollectionContentType.TAG ? contentId.Id : null,
                    ChildCollectionId = contentId.Type == CollectionContentType.COLLECTION ? contentId.Id : null
                });
                collectionContents.Add(collectionContent);
            }
            catch (System.Exception)
            {
                continue;
            }
        }

        return collectionContents;
    }

    public bool RemoveContentsFromCollection(RemoveContentsFromCollectionInput input)
    {
        var filter = Builders<Models.Collection>.Filter.Eq(r => r.Id, input.Id);

        if (input.UserId is not null)
        {
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedById, input.UserId);
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedByRole, CollectionCreatedByRole.USER);
        }
        else
        {
            filter &= Builders<Models.Collection>.Filter.Eq(r => r.CreatedByRole, CollectionCreatedByRole.SYSTEM);
        }

        var oldCollection = _collectionCollection.Find(filter).FirstOrDefault();
        if (oldCollection is null)
        {
            throw new HttpRequestException("CollectionNotFound");
        }

        var collectionContents = new List<CollectionContent>();

        foreach (var contentId in input.ContentIds)
        {
            // if collectionContent is available
            var collectionContentFilter = Builders<CollectionContent>.Filter.Eq(r => r.CollectionId, input.Id);

            if (input.Type == "TAG")
            {
                collectionContentFilter &= Builders<CollectionContent>.Filter.Eq(r => r.TagId, contentId);
            }
            else if (input.Type == "COLLECTION")
            {
                collectionContentFilter &= Builders<CollectionContent>.Filter.Eq(r => r.ChildCollectionId, contentId);
            }
            else if (input.Type == "CONTENT")
            {
                collectionContentFilter &= Builders<CollectionContent>.Filter.Eq(r => r.ContentId, contentId);
            }

            var oldCollectionContent = _collectionContentCollection.Find(collectionContentFilter).FirstOrDefault();

            if (oldCollectionContent is null)
            {
                continue;
            }
            _collectionContentCollection.DeleteOne(collectionContentFilter);
            var collection = _collectionCollection.Find(Builders<Models.Collection>.Filter.Eq(r => r.Id, oldCollectionContent.CollectionId)).FirstOrDefault();

            _ = _cacheProvider.EntityChanged(new[] {
                $"{CacheProvider.CacheEntities["collections"]}*{collection.Id}*",
                $"{CacheProvider.CacheEntities["collections"]}*{collection.Slug}*",
                $"{CacheProvider.CacheEntities["collections"]}*{collection.Name}*",
            });

            collectionContents.Add(oldCollectionContent);
        }

        _collectionService.UpdateCollectionContentsCount(input.Id, -collectionContents.Count);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*contents*",
        });
        return true;
    }

    public async Task<CollectionContent> FeatureCollection(string collectionId)
    {
        var collection = _collectionService.GetCollection(collectionId);

        if (collection.IsFeatured)
        {
            throw new HttpRequestException("CollectionAlreadyFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_collections");

        var newCollectionContent = SaveCollectionContent(new SaveCollectionContent
        {
            CollectionId = featuredCollection.Id,
            Type = "COLLECTION",
            ChildCollectionId = collection.Id,
        });

        var update = Builders<Models.Collection>.Update
            .Set("is_featured", true)
            .Set("updated_at", DateTime.UtcNow);
        await _collectionCollection.UpdateOneAsync(collection => collection.Id == collectionId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Slug}*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Id}*",
        });

        return newCollectionContent;
    }

    public async Task<bool> UnFeatureCollection(string collectionId)
    {
        var collection = _collectionService.GetCollection(collectionId);

        if (!collection.IsFeatured)
        {
            throw new HttpRequestException("CollectionNotFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_collections");

        RemoveContentsFromCollection(new RemoveContentsFromCollectionInput
        {
            ContentIds = [collectionId],
            Id = featuredCollection.Id,
            Type = "COLLECTION",
        });

        var update = Builders<Models.Collection>.Update
            .Set("is_featured", false)
            .Set("updated_at", DateTime.UtcNow);
        await _collectionCollection.UpdateOneAsync(tag => tag.Id == collectionId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["collections"]}.find*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Slug}*",
            $"{CacheProvider.CacheEntities["collections"]}*{collection.Id}*",
        });

        return true;
    }


    public async Task<CollectionContent> FeatureTag(string tagId)
    {
        var tag = await _searchTagService.Get(tagId);
        if (tag is null)
        {
            throw new HttpRequestException("TagNotFound");
        }

        if (tag.IsFeatured)
        {
            throw new HttpRequestException("TagAlreadyFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_tags");

        var newCollectionContent = SaveCollectionContent(new SaveCollectionContent
        {
            CollectionId = featuredCollection.Id,
            Type = "TAG",
            TagId = tag.Id,
        });

        var update = Builders<Models.Tag>.Update
            .Set("is_featured", true)
            .Set("updated_at", DateTime.UtcNow);
        await _tagCollection.UpdateOneAsync(tag => tag.Id == tagId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["tags"]}.find*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Slug}*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Id}*",
        });

        return newCollectionContent;
    }

    public async Task<bool> UnFeatureTag(string tagId)
    {
        var tag = await _searchTagService.Get(tagId);
        if (tag is null)
        {
            throw new HttpRequestException("TagNotFound");
        }

        if (!tag.IsFeatured)
        {
            throw new HttpRequestException("TagNotFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_tags");

        RemoveContentsFromCollection(new RemoveContentsFromCollectionInput
        {
            ContentIds = [tagId],
            Id = featuredCollection.Id,
            Type = "TAG",
        });

        var update = Builders<Models.Tag>.Update
            .Set("is_featured", false)
            .Set("updated_at", DateTime.UtcNow);
        await _tagCollection.UpdateOneAsync(tag => tag.Id == tagId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["tags"]}.find*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Slug}*",
            $"{CacheProvider.CacheEntities["tags"]}*{tag.Id}*",
        });

        return true;
    }

    public async Task<CollectionContent> FeatureContent(string contentId)
    {
        var content = await _searchContentService.GetContentById(contentId);

        if (content.IsFeatured)
        {
            throw new HttpRequestException("ContentAlreadyFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_contents");

        var newCollectionContent = SaveCollectionContent(new SaveCollectionContent
        {
            CollectionId = featuredCollection.Id,
            Type = "CONTENT",
            ContentId = content.Id,
        });

        var update = Builders<Models.Content>.Update
            .Set("is_featured", true)
            .Set("updated_at", DateTime.UtcNow);
        await _contentCollection.UpdateOneAsync(content => content.Id == contentId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["contents"]}.find*",
            $"{CacheProvider.CacheEntities["contents"]}*{content.Slug}*",
            $"{CacheProvider.CacheEntities["contents"]}*{content.Id}*",
        });

        return newCollectionContent;
    }

    public async Task<bool> UnFeatureContent(string contentId)
    {
        var content = await _searchContentService.GetContentById(contentId);

        if (!content.IsFeatured)
        {
            throw new HttpRequestException("ContentNotFeatured");
        }

        var featuredCollection = _collectionService.GetCollectionBySlug("featured_contents");

        RemoveContentsFromCollection(new RemoveContentsFromCollectionInput
        {
            ContentIds = [contentId],
            Id = featuredCollection.Id,
            Type = "CONTENT",
        });

        var update = Builders<Models.Content>.Update
            .Set("is_featured", false)
            .Set("updated_at", DateTime.UtcNow);
        await _contentCollection.UpdateOneAsync(content => content.Id == contentId, update);

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["contents"]}.find*",
            $"{CacheProvider.CacheEntities["contents"]}*{content.Slug}*",
            $"{CacheProvider.CacheEntities["contents"]}*{content.Id}*",
        });

        return true;
    }

}