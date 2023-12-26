using main.DTOs;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace main.Domains;

public class IndexContent
{

    private readonly ILogger<IndexContent> _logger;
    private readonly IMongoCollection<Content> _contentsCollection;

    public IndexContent(ILogger<IndexContent> logger,  IOptions<DatabaseSettings> bookStoreDatabaseSettings,  IOptions<AppConstants> appConstants)
    {
        _logger = logger;
        var client = new MongoClient(bookStoreDatabaseSettings.Value.ConnectionString);
        var database = client.GetDatabase(bookStoreDatabaseSettings.Value.DatabaseName);
        _contentsCollection = database.GetCollection<Content>(appConstants.Value.ContentCollection);
        _logger.LogDebug("IndexContentService initialized");
    }

    public string Index()
    {
        return "Hello World!";
    }


    public async Task<bool> Save(SaveMedia[] mediaInput)
    {
        var contents = mediaInput.Select(media => new Content
        {
            Visibility = media.Visibility,
            Amount = Convert.ToInt32(media.Amount * 100),
            Media = media.Content,
        });

        await _contentsCollection.InsertManyAsync(contents);

        // TODO: push to queue for image processing
        return true;
    }
}