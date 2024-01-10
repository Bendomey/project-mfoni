using System.Security.Claims;
using main.DTOs;

namespace main.Middlewares;

public class CurrentUser
{
    public static CurrentUserOutput? GetCurrentUser(ClaimsIdentity? identity)
    {
        if (identity is not null)
        {

            if (identity != null)
            {
                var currentUserId = identity.FindFirst("id");
                var currentUserRole = identity.FindFirst(ClaimTypes.Role);

                return new CurrentUserOutput
                {
                    Id = currentUserId!.Value,
                    Role = currentUserRole!.Value
                };

            }
        }

        return null;
    }

}
