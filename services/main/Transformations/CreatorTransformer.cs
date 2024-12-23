

using main.Configuratons;
using main.Domains;
using main.DTOs;
using main.Models;


namespace main.Transformations;

public class CreatorTransformer
{
    private readonly SubscriptionService _subscriptionService;
    private readonly UserService _userService;
    private readonly CacheProvider _cacheProvider;
    private readonly CreatorSubscriptionTransformer _creatorSubscriptionTransformer;

    public CreatorTransformer(
        SubscriptionService subscriptionService,
        UserService userService,
        CreatorSubscriptionTransformer creatorSubscriptionTransformer,
        CacheProvider cacheProvider
    )
    {
        _subscriptionService = subscriptionService;
        _userService = userService;
        _creatorSubscriptionTransformer = creatorSubscriptionTransformer;
        _cacheProvider = cacheProvider;
    }

    public async Task<OutputCreator> Transform(Creator creator, string[]? populate = null)
    {
        populate ??= Array.Empty<string>();

        OutputCreatorSubscription? subscriptionTransformer = null;
        if (populate.Any(p => p.Contains(PopulateKeys.SUBSCRIPTION)))
        {
            var subscription = await _subscriptionService.GetActiveCreatorSubscription(creator.Id);
            subscriptionTransformer = await _creatorSubscriptionTransformer.Transform(subscription, populate);
        }

        return new OutputCreator
        {
            Id = creator.Id,
            UserId = creator.UserId,
            Username = creator.Username,
            Subscription = subscriptionTransformer,
            Status = creator.Status,
            CreatorApplicationId = creator.CreatorApplicationId,
            SocialMedia = creator.SocialMedia,
            Interests = creator.Interests,
            About = creator.About,
            Followers = creator.Followers,
            Address = creator.Address,
            CreatedAt = creator.CreatedAt,
            UpdatedAt = creator.UpdatedAt,
        };
    }


    public async Task<OutputBasicCreator> TransformBasicCreator(Creator creator)
    {

        var user = await _cacheProvider.ResolveCache($"users.{creator.UserId}", () => _userService.GetUserById(creator.UserId));

        return new OutputBasicCreator
        {
            Id = user.Id,
            Name = user.Name,
            Photo = user.Photo,
            SocialMedia = creator.SocialMedia,
            Username = creator.Username,
            Address = creator.Address,
        };
    }

    public async Task<OutputCreatorEnhanced> TransformEnhancedCreator(Creator creator, string[]? populate = null)
    {

        var user = await _cacheProvider.ResolveCache($"users.{creator.UserId}", () => _userService.GetUserById(creator.UserId));

        return new OutputCreatorEnhanced
        {
            Id = creator.Id,
            Name = user.Name,
            Photo = user.Photo,
            UserId = creator.UserId,
            Username = creator.Username,
            SocialMedia = creator.SocialMedia,
            Interests = creator.Interests,
            About = creator.About,
            Followers = creator.Followers,
            Address = creator.Address,
            CreatedAt = creator.CreatedAt,
        };
    }
}