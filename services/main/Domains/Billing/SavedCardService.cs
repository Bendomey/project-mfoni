using System.Net;
using main.Configurations;
using main.Configuratons;
using main.Lib;
using main.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;


namespace main.Domains;

public class SavedCardService
{
    private readonly ILogger<SavedCardService> _logger;
    private readonly AppConstants _appConstantsConfiguration;
    private readonly IMongoCollection<Models.SavedCard> _savedCardCollection;
    private readonly IMongoCollection<Models.User> _userCollection;
    private readonly MongoClient _mongoClient;

    public SavedCardService(ILogger<SavedCardService> logger, DatabaseSettings databaseConfig, IOptions<AppConstants> appConstants)
    {
        _logger = logger;
        _appConstantsConfiguration = appConstants.Value;

        _mongoClient = databaseConfig.Client;
        var database = databaseConfig.Database;
        _savedCardCollection = database.GetCollection<Models.SavedCard>(appConstants.Value.SavedCardCollection);
        _userCollection = database.GetCollection<Models.User>(appConstants.Value.UserCollection);
    }

    public async Task<Models.SavedCard> GetById(string id)
    {
        var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.Id, id)
                        & Builders<Models.SavedCard>.Filter.Eq(p => p.DeletedAt, null);

        var card = await _savedCardCollection.Find(filter).FirstOrDefaultAsync();

        if (card is null)
        {
            throw new HttpRequestException(
               "SavedCardNotFound",
               inner: default,
               statusCode: HttpStatusCode.NotFound
           );
        }

        return card;
    }

    public async Task<Models.SavedCard> Create(Models.SavedCard input, IClientSessionHandle? session)
    {
        var user = await GetUserById(input.UserId);

        if (input.Reusable)
        {
            // check if there's any other primary card for the user.
            var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.UserId, input.UserId) &
                        Builders<Models.SavedCard>.Filter.Exists(p => p.DefaultedAt) &
                        Builders<Models.SavedCard>.Filter.Eq(p => p.DeletedAt, null);

            var existingPrimaryCard = await _savedCardCollection.Find(session, filter).FirstOrDefaultAsync();

            if (existingPrimaryCard == null)
            {
                // there's no existing primary card for the user.
                input.DefaultedAt = DateTime.UtcNow;
            }
        }
        else
        {
            input.AuthorizationCode = null;
        }

        await _savedCardCollection.InsertOneAsync(session, input);

        // Notifications

        if (input.Reusable)
        {
            //   send a success notification for successful card creation.
            var body = EmailTemplates.SuccessfulCardSavedBody
                        .Replace("{name}", user.Name)
                        .Replace("{cardType}", StringLib.CapitalizeFirstLetter(input.CardType.ToLower()))
                        .Replace("{last4Digits}", input.Last4)
                        .Replace("{dateAdded}", DateTime.Now.ToString("dd MMMM, yyyy"))
                        .Replace("{viewCardLink}", $"{_appConstantsConfiguration.WebsiteUrl}/account/saved-cards");

            var _ = EmailConfiguration.Send(new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = input.Email,
                Subject = EmailTemplates.SuccessfulCardSavedSubject,
                Message = body,
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }
        else
        {
            var body = EmailTemplates.SuccessfulSavedCardButNotReusuableBody
                        .Replace("{name}", user.Name)
                        .Replace("{cardType}", StringLib.CapitalizeFirstLetter(input.CardType.ToLower()))
                        .Replace("{last4Digits}", input.Last4)
                        .Replace("{dateAdded}", DateTime.Now.ToString("dd MMMM, yyyy"))
                        .Replace("{viewCardLink}", $"{_appConstantsConfiguration.WebsiteUrl}/account/saved-cards")
                        .Replace("{addAnotherCardLink}", $"{_appConstantsConfiguration.WebsiteUrl}/account/saved-cards");

            var _ = EmailConfiguration.Send(new SendEmailInput
            {
                From = _appConstantsConfiguration.EmailFrom,
                Email = input.Email,
                Subject = EmailTemplates.SuccessfulSavedCardButNotReusuableSubject,
                Message = body,
                ApiKey = _appConstantsConfiguration.ResendApiKey
            });
        }

        return input;
    }

    public async Task Remove(string id, string userId)
    {
        var savedCard = await GetById(id);

        if (savedCard.UserId != userId)
        {
            throw new HttpRequestException(
                "SavedCardNotFound",
                inner: default,
                statusCode: HttpStatusCode.NotFound
            );
        }

        if (savedCard.DefaultedAt is not null)
        {
            throw new HttpRequestException("Cannot delete a primary card. Please set another card as primary before deleting this card.");
        }

        if (savedCard.AuthorizationCode is not null)
        {
            // Invalidate the authorization code.
            await PaystackDeactivateAuthorizationCodeConfiguration.Call(
                _appConstantsConfiguration.PaystackSecretKey,
                new DeactivateAuthorizationCodeInput
                {
                    AuthorizationCode = savedCard.AuthorizationCode
                }
            );
        }

        var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.Id, id);
        await _savedCardCollection.UpdateOneAsync(
            filter,
            Builders<Models.SavedCard>.Update
                .Set(x => x.DeletedAt, DateTime.UtcNow)
                .Set(x => x.UpdatedAt, DateTime.UtcNow)
                .Set(x => x.Status, "SavedCard.Status.Inactive")
                .Unset(x => x.DefaultedAt) // remove primary status if any
                .Unset(x => x.AuthorizationCode) // invalidate auth code
        );

        var user = await GetUserById(savedCard.UserId);

        var body = EmailTemplates.SuccessfulCardDeletedBody
                    .Replace("{name}", user.Name)
                    .Replace("{last4Digits}", savedCard.Last4);

        var _ = EmailConfiguration.Send(new SendEmailInput
        {
            From = _appConstantsConfiguration.EmailFrom,
            Email = savedCard.Email,
            Subject = EmailTemplates.SuccessfulCardDeletedSubject,
            Message = body,
            ApiKey = _appConstantsConfiguration.ResendApiKey
        });
    }

    public async Task<List<SavedCard>> GetAll(
        FilterQuery<SavedCard> queryFilter,
        GetSavedCardsInput input
    )
    {
        var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.UserId, input.UserId) &
                     Builders<Models.SavedCard>.Filter.Eq(p => p.DeletedAt, null);

        if (!string.IsNullOrEmpty(input.Status))
        {
            filter &= Builders<Models.SavedCard>.Filter.Eq(p => p.Status, input.Status);
        }

        if (input.Reusable.HasValue)
        {
            filter &= Builders<Models.SavedCard>.Filter.Eq(p => p.Reusable, input.Reusable.Value);
        }

        var cards = await _savedCardCollection
                        .Find(filter)
                        .Skip(queryFilter.Skip)
                        .Limit(queryFilter.Limit)
                        .Sort(queryFilter.Sort)
                        .ToListAsync();

        return cards;
    }

    public async Task<long> Count(
        GetSavedCardsInput input
    )
    {
        var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.UserId, input.UserId) &
                     Builders<Models.SavedCard>.Filter.Eq(p => p.DeletedAt, null);

        if (!string.IsNullOrEmpty(input.Status))
        {
            filter &= Builders<Models.SavedCard>.Filter.Eq(p => p.Status, input.Status);
        }

        if (input.Reusable.HasValue)
        {
            filter &= Builders<Models.SavedCard>.Filter.Eq(p => p.Reusable, input.Reusable.Value);
        }

        return await _savedCardCollection.CountDocumentsAsync(filter);
    }

    public async Task<Models.SavedCard> SetAsPrimary(string id, string userId)
    {
        var savedCard = await GetById(id);

        if (savedCard.UserId != userId)
        {
            throw new HttpRequestException(
                "SavedCardNotFound",
                inner: default,
                statusCode: HttpStatusCode.NotFound
            );
        }

        if (!savedCard.Reusable || savedCard.Status != "SavedCard.Status.Active")
        {
            throw new HttpRequestException("Cannot set a non-reusable or inactive card as primary.");
        }

        using (var session = await _mongoClient.StartSessionAsync())
        {
            try
            {
                session.StartTransaction();

                // unset any existing primary card for the user.
                var filter = Builders<Models.SavedCard>.Filter.Eq(p => p.UserId, userId) &
                             Builders<Models.SavedCard>.Filter.Exists(p => p.DefaultedAt) &
                             Builders<Models.SavedCard>.Filter.Eq(p => p.DeletedAt, null);

                await _savedCardCollection.UpdateManyAsync(
                    session,
                    filter,
                    Builders<Models.SavedCard>.Update.Unset(x => x.DefaultedAt)
                );

                // set the selected card as primary.
                savedCard.DefaultedAt = DateTime.UtcNow;
                await _savedCardCollection.ReplaceOneAsync(
                     session,
                     c => c.Id == savedCard.Id,
                     savedCard
                );

                await session.CommitTransactionAsync();

            }
            catch (MongoCommandException ex) when (ex.CodeName == "IllegalOperation")
            {
                _logger.LogInformation($"Details: {ex.Message}");
                await session.AbortTransactionAsync();
            }
            catch (Exception ex)
            {
                await session.AbortTransactionAsync();
                _logger.LogError(ex, "Error setting card as primary");
                throw;
            }
        }

        var user = await GetUserById(savedCard.UserId);

        var body = EmailTemplates.SavedCardSetAsPrimaryBody
                    .Replace("{name}", user.Name)
                    .Replace("{cardType}", StringLib.CapitalizeFirstLetter(savedCard.CardType.ToLower()))
                    .Replace("{last4Digits}", savedCard.Last4)
                    .Replace("{dateUpdated}", DateTime.Now.ToString("dd MMMM, yyyy"))
                    .Replace("{viewCardLink}", $"{_appConstantsConfiguration.WebsiteUrl}/account/saved-cards");

        var _ = EmailConfiguration.Send(new SendEmailInput
        {
            From = _appConstantsConfiguration.EmailFrom,
            Email = savedCard.Email,
            Subject = EmailTemplates.SavedCardSetAsPrimarySubject,
            Message = body,
            ApiKey = _appConstantsConfiguration.ResendApiKey
        });

        return savedCard; // return the updated card
    }

    private async Task<Models.User> GetUserById(string userId)
    {
        var user = await _userCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
        if (user is null)
        {
            throw new HttpRequestException("UserNotFound");
        }

        return user;
    }
}