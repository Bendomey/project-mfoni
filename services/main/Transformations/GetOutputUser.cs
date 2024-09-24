using main.DTOs;
using main.Models;

namespace main.Transformations;

public class GetOutputUser
{
    private OutputUser _user;

    public GetOutputUser(User user)
    {
        //TODO:: @Bendomey - Investigate this warning
        _user = new OutputUser
        {
            Status = user.Status,
            Id = user.Id,
            Role = user.Role,
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Photo = user.Photo,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public OutputUser Result()
    {
        return _user;
    }
}
