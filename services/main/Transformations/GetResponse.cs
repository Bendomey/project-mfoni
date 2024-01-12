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