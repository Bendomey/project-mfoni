

using main.DTOs;
using main.Models;


public class GetOutputUser
{
    private OutputUser _user;
    public GetOutputUser(User user)
    {
        _user = new OutputUser
        {
            Id = user.Id,
            Role = user.Role,
            Name = user.Name,
            Username = user.Username,
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