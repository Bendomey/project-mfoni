using System.Net;
using System.Security.Claims;
using main.DTOs;

namespace main.Middlewares;

public class CurrentAdmin
{
    public static CurrentUserOutput GetCurrentAdmin(ClaimsIdentity? identity)
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

        throw new HttpRequestException("AdminNotFound", null, HttpStatusCode.Unauthorized);
    }

}
