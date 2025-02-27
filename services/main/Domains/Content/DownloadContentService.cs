using System.Net;
using main.Configuratons;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Domains;

public class DownloadContentService
{
    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;
    private readonly IMongoCollection<ContentDownload> _contentDownloadsCollection;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly CacheProvider _cacheProvider;

    public DownloadContentService(
        ILogger<IndexContent> logger,
        DatabaseSettings databaseConfig,
        IOptions<AppConstants> appConstants,
        CacheProvider cacheProvider
    )
    {
        _logger = logger;
        var database = databaseConfig.Database;

        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _contentDownloadsCollection = database.GetCollection<ContentDownload>(appConstants.Value.ContentDownloadCollection);

        _appConstantsConfiguration = appConstants.Value;
        _cacheProvider = cacheProvider;

        _logger.LogDebug("DownloadContentService initialized");
    }

    public async Task<S3MetaData?> DownloadContent(DownloadContentInput input)
    {
        // TODO: If content is paid, verify if user has paid for this content first. 
        var content = await _contentsCollection.Find(c => c.Id == input.ContentId).FirstOrDefaultAsync();
        if (content == null)
        {
            throw new HttpRequestException("Content not found", default, HttpStatusCode.NotFound);
        }

        S3MetaData? contentMedia = null;
        if (input.Size == ContentDownloadType.SMALL && content.SmallMedia != null)
        {
            contentMedia = content.SmallMedia;
        }
        else if (input.Size == ContentDownloadType.MEDIUM && content.MediumMedia != null)
        {
            contentMedia = content.MediumMedia;
        }
        else if (input.Size == ContentDownloadType.LARGE && content.LargeMedia != null)
        {
            contentMedia = content.LargeMedia;
        }
        else if (input.Size == ContentDownloadType.ORIGINAL)
        {
            contentMedia = content.Media;
        }

        if (contentMedia == null)
        {
            throw new HttpRequestException("Content media not found", default, HttpStatusCode.NotFound);
        }

        await _contentDownloadsCollection.InsertOneAsync(new ContentDownload
        {
            Type = input.Size,
            ContentId = input.ContentId,
            UserId = input.UserId
        });

        await _contentsCollection.UpdateOneAsync(
            Builders<Content>.Filter.Eq(c => c.Id, input.ContentId),
            Builders<Content>.Update.Inc(c => c.Downloads, 1)
        );

        _ = _cacheProvider.EntityChanged(new[] {
            $"{CacheProvider.CacheEntities["contents"]}.find*",
            $"{CacheProvider.CacheEntities["contents"]}*{input.ContentId}*",
            $"{CacheProvider.CacheEntities["contents"]}*{content.Slug}*",
        });

        return contentMedia;
    }

}