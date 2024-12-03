using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class UserTransformer
{
    private readonly CreatorService _creatorService;
    private readonly CreatorTransformer _creatorTransformer;
    public UserTransformer(CreatorService creatorService, CreatorTransformer creatorTransformer)
    {
        _creatorService = creatorService;
        _creatorTransformer = creatorTransformer;
    }

    public async Task<OutputUser> Transform(User user, string[]? populate = null)
    {

        populate ??= Array.Empty<string>();

        OutputCreator? creatorTransformed = null;
        if (user.Role == UserRole.CREATOR && populate.Any(p => p.Contains(PopulateKeys.CREATOR)))
        {
            var creator = await _creatorService.GetCreatorByUserId(user.Id);
            var creatorTransformer = await _creatorTransformer.Transform(creator, populate);
            creatorTransformed = creatorTransformer;
        }
        // try
        // {
        //     var creator = await _creatorService.GetCreatorByUserId(user.Id);
        //     var creatorTransformer = await _creatorTransformer.Transform(creator);
        //     creatorTransformed = creatorTransformer;
        // }
        // catch (Exception)
        // {
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
            Wallet = user.Wallet,
            BookWallet = user.BookWallet,
            Creator = creatorTransformed,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
        };
    }
}
