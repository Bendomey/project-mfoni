using main.DTOs;
using main.Models;

namespace main.Transformations;

public class MfoniPackageTransformer
{

    public MfoniPackageTransformer()
    {
    }

    public OutputMfoniPackage Transform(MfoniPackage mfoniPackage)
    {
        return new OutputMfoniPackage
        {
            Id = mfoniPackage.Id,
            Name = mfoniPackage.Name,
            Description = mfoniPackage.Description,
            Amount = mfoniPackage.Amount,
            Currency = mfoniPackage.Currency,
            Code = mfoniPackage.Code,
            Status = mfoniPackage.Status,
            Features = mfoniPackage.Features.Select(feature => new OutputMfoniPackageFeature
            {
                Code = feature.Code,
                Name = feature.Name,
                Description = feature.Description,
                Type = feature.Type,
                Value = feature.Value,
            }).ToList(),
            CreatedAt = mfoniPackage.CreatedAt,
            UpdatedAt = mfoniPackage.UpdatedAt,
        };
    }
}