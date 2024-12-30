

using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class ExploreSectionTransformer
{
    private readonly ExploreSectionService _exploreSectionService;
    private readonly AdminService _adminService;
    private readonly AdminTransformer _adminTransformer;
    public ExploreSectionTransformer(
        ExploreSectionService exploreSectionService,
        AdminService adminService,
        AdminTransformer adminTransformer
    )
    {
        _exploreSectionService = exploreSectionService;
        _adminService = adminService;
        _adminTransformer = adminTransformer;
    }

    public OutputExploreSection Transform(ExploreSection exploreSection, string[]? populate = null)
    {

        populate ??= Array.Empty<string>();

        OutputAdmin? outputCreatedByAdmin = null;
        if (exploreSection.CreatedById is not null && populate.Any(p => p.Contains(PopulateKeys.EXPLORE_SECTION_CREATED_BY)))
        {
            var createdBy = _adminService.GetAdminById(exploreSection.CreatedById);
            if (createdBy is not null)
            {
                outputCreatedByAdmin = _adminTransformer.Transform(createdBy, populate);
            }
        }

        return new OutputExploreSection
        {
            Id = exploreSection.Id,
            Visibility = exploreSection.Visibility,
            SeeMorePathname = exploreSection.SeeMorePathname,
            Endpoint = exploreSection.Endpoint,
            Sort = exploreSection.Sort,
            Title = exploreSection.Title,
            Type = exploreSection.Type,
            EnsureAuth = exploreSection.EnsureAuth,
            CreatedBy = outputCreatedByAdmin,
            CreatedAt = exploreSection.CreatedAt,
            UpdatedAt = exploreSection.UpdatedAt,
        };
    }
}