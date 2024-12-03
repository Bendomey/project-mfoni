

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class AdminTransformer
{
    private readonly AdminService _adminService;
    public AdminTransformer(AdminService adminService)
    {
        _adminService = adminService;
    }

    public OutputAdmin Transform(Admin admin, string[]? populate = null)
    {

        populate ??= Array.Empty<string>(); 

        OutputAdmin? outputCreatedByAdmin = null;
        if (admin.CreatedById is not null && populate.Any(p => p.Contains(PopulateKeys.ADMIN_CREATED_BY)))
        {
            var createdBy = _adminService.GetAdminById(admin.CreatedById);
            if (createdBy is not null)
            {
                outputCreatedByAdmin = Transform(createdBy, populate);
            }
        }

        return new OutputAdmin
        {
            Id = admin.Id,
            Name = admin.Name,
            Email = admin.Email,
            CreatedBy = outputCreatedByAdmin,
            CreatedAt = admin.CreatedAt,
            UpdatedAt = admin.UpdatedAt,
        };
    }
}