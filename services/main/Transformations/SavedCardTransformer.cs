using main.DTOs;
using main.Models;

namespace main.Transformations;

public class SavedCardTransformer
{

    public SavedCardTransformer()
    {
    }

    public OutputSavedCard Transform(SavedCard savedCard)
    {
        return new OutputSavedCard
        {
            Id = savedCard.Id,
            UserId = savedCard.UserId,
            DefaultedAt = savedCard.DefaultedAt,
            CardType = savedCard.CardType,
            First6 = savedCard.First6,
            Last4 = savedCard.Last4,
            ExpiryYear = savedCard.ExpiryYear,
            ExpiryMonth = savedCard.ExpiryMonth,
            Bank = savedCard.Bank,
            Channel = savedCard.Channel,
            Reusable = savedCard.Reusable,
            CountryCode = savedCard.CountryCode,
            AccountName = savedCard.AccountName,
            Email = savedCard.Email,
            Status = savedCard.Status,
            CreatedAt = savedCard.CreatedAt,
            UpdatedAt = savedCard.UpdatedAt,
        };
    }
}