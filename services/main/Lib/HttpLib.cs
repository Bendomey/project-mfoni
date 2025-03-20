using main.Transformations;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace main.Lib;

public class FilterQuery<T>
{
    public required int Skip { get; set; }
    public required int Limit { get; set; }
    public required int Page { get; set; }
    public required string[] Populate { get; set; }
    public SortDefinition<T>? Sort { get; set; }
}

public class HttpLib
{
    public static FilterQuery<T> GenerateFilterQuery<T>(
        int? page,
        int? pageSize,
        string? sortParam,
        string sortBy,
        string? populate = ""
    )
    {
        var updatedPage = page ?? 0;
        var updatedPageSize = pageSize ?? 50;
        var sort = Builders<T>.Sort.Descending(sortBy);
        if (sortParam is "asc")
        {
            sort = Builders<T>.Sort.Ascending(sortBy);
        }

        var skip = (updatedPage == 0) ? 0 : updatedPage * updatedPageSize;

        var queryFilter = new FilterQuery<T>
        {
            Skip = skip,
            Limit = updatedPageSize,
            Page = updatedPage,
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
            Page = queryFilter.Page,
            NextPage = queryFilter.Page >= totalPages - 1 ? null : queryFilter.Page + 1,
            PrevPage =
                queryFilter.Page <= 0
                    ? null
                    : queryFilter.Page > totalPages
                        ? totalPages
                        : queryFilter.Page - 1,
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