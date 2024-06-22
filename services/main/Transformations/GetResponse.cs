using main.DTOs;


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
    public required List<T> Data { get; set; }
    public required long DataLength { get; set; }
    public required long DataPerPage { get; set; }
    public required long CurrentPage { get; set; }
    public long? NextPage { get; set; }
    public long? PrevPage { get; set; }
    public required long TotalPages { get; set; }
}