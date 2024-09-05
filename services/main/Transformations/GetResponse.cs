using main.DTOs;

namespace main.Transformations;

public class GetEntityResponse<T>
{
    private OutputResponse<T> response;

    public GetEntityResponse(T? result, string? errorMessage)
    {
        response = new OutputResponse<T>
        {
            Data = result,
            Status = result != null,
            ErrorMessage = errorMessage,
        };
    }

    public OutputResponse<T> Result()
    {
        return response;
    }
}

public class EntityWithPagination<T>
{
    public required List<T> Rows { get; set; }
    public required long Total { get; set; }
    public required long PageSize { get; set; }
    public required long Page { get; set; }
    public long? NextPage { get; set; }
    public long? PrevPage { get; set; }
    public required long TotalPages { get; set; }
}