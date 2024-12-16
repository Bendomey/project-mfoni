using main.Configuratons;
using main.Domains;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

public class PermissionService
{
    private readonly ILogger<PermissionService> _logger;
    private readonly CollectionService _collectionService;
    private readonly CreatorService _creatorService;

    public PermissionService(
        ILogger<PermissionService> logger,
        CreatorService creatorService,
        CollectionService collectionService
    )
    {
        _logger = logger;
        _creatorService = creatorService;
        _collectionService = collectionService;

        _logger.LogDebug("IndexContentService initialized");
    }

    public async Task<GetUserInfoResponse> CanUploadContent(string userId, int contentsLength)
    {
        var userInfo = await IsAPremiumCreator(userId);

        var userUploadCollectionSlug = $"{userInfo.User.Id}_uploads";

        var creatorUploadsCount = 0;
        try
        {
            var uploadCollection = _collectionService.GetCollectionBySlug(userUploadCollectionSlug);
            creatorUploadsCount = uploadCollection.ContentsCount;
        }
        catch (Exception) { }

        if (creatorUploadsCount + contentsLength > PermissionsHelper.GetNumberOfUploadsForPackageType(userInfo.CreatorSubscription.PackageType))
        {
            throw new HttpRequestException("UploadLimitReached", null, System.Net.HttpStatusCode.Forbidden);
        }

        return userInfo;
    }

    public async Task<GetUserInfoResponse> IsAPremiumCreator(string userId)
    {
        var userInfo = await _creatorService.GetUserInfo(userId);

        // check if user is a creator
        if (userInfo.User.Role != UserRole.CREATOR || userInfo.CreatorSubscription is null)
        {
            throw new HttpRequestException("NotEnoughPermission", null, System.Net.HttpStatusCode.Forbidden);
        }

        var yourPermissions = PermissionsHelper.GetPermissionsForPackageType(userInfo.CreatorSubscription.PackageType);

        if (!PermissionsHelper.Can(new CanInput
        {
            Action = Permissions.UploadContent,
            Permissions = yourPermissions
        }))
        {
            throw new HttpRequestException("NotEnoughPermission", null, System.Net.HttpStatusCode.Forbidden);
        }

        return userInfo;
    }

}