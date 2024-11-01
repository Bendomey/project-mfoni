

using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorPackageTransformer
{

    public CreatorPackageTransformer()
    {
    }

    public OutputCreatorPackage Transform(CreatorPackage creatorPackage)
    {
        return new OutputCreatorPackage
        {
            Id = creatorPackage.Id,
            PackageType = creatorPackage.PackageType,
            Status = creatorPackage.Status,
            DeactivatedAt = creatorPackage.DeactivatedAt,
            CreatedAt = creatorPackage.CreatedAt,
            UpdatedAt = creatorPackage.UpdatedAt,
        };
    }
}