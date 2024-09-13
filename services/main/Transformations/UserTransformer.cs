using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class UserTransformer
{
    public UserTransformer()
    {
    }

    public OutputUser Transform(User user)
    {
        // OutputCreator? outputCreator = null;
        // if (user. is not null)
        // {
        //     var createdBy = _adminService.GetAdminById(user.CreatedById);
        //     if (createdBy is not null)
        //     {
        //         outputCreatedByAdmin = Transform(createdBy);
        //     }
        // }

        return new OutputUser
        {
            Id = user.Id,
            Name = user.Name,
            Role = user.Role,
            Status = user.Status,
            Email = user.Email,
            EmailVerifiedAt = user.EmailVerifiedAt,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberVerifiedAt = user.PhoneNumberVerifiedAt,
            Photo = user.Photo,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
        };
    }
}