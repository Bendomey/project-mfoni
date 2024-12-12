using main.Transformations;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Lib;

public class FilterQuery<T>
{
    public required int Skip { get; set; }
    public required int Limit { get; set; }
    public required string[] Populate { get; set; }
    public SortDefinition<T>? Sort { get; set; }
}

public class HttpLib
{
    public static FilterQuery<T> GenerateFilterQuery<T>(
        int? skip,
        int? limit,
        string? sortParam,
        string sortBy,
        string? populate = ""
    )
    {
        var sort = Builders<T>.Sort.Descending(sortBy);
        if (sortParam is "asc")
        {
            sort = Builders<T>.Sort.Ascending(sortBy);
        }

        var queryFilter = new FilterQuery<T>
        {
            Skip = skip ?? 0,
            Limit = limit ?? 50,
            Sort = sort,
            Populate = populate?.Split(",") ?? Array.Empty<string>(),
        };

        return queryFilter;
    }

    public static EntityWithPagination<T> GeneratePagination<T, Q>(
        List<T> data,
        long dataLength,
        FilterQuery<Q> queryFilter
    )
    {
        var totalPages = (int)Math.Ceiling((double)dataLength / queryFilter.Limit);

        var response = new EntityWithPagination<T>
        {
            Rows = data,
            Total = dataLength,
            PageSize = queryFilter.Limit,
            Page = queryFilter.Skip,
            NextPage = queryFilter.Skip >= totalPages - 1 ? null : queryFilter.Skip + 1,
            PrevPage =
                queryFilter.Skip <= 0
                    ? null
                    : queryFilter.Skip > totalPages
                        ? totalPages
                        : queryFilter.Skip - 1,
            TotalPages = totalPages,
        };

        return response;
    }
}


public class MongoAggregationGetCount
{
    [BsonElement("totalCount")]
    public int TotalCount;
}