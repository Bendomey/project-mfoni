using main.DTOs;
using main.Models;


namespace main.Transformations;

public class PaymentTransformer
{
    public OutputPayment Transform(Payment payment, string[]? populate = null)
    {
        populate ??= Array.Empty<string>();

        return new OutputPayment
        {
            Id = payment.Id,
            Amount = payment.Amount,
            Reference = payment.Reference,
            Status = payment.Status,
            AccessCode = payment.AccessCode,
            AuthorizationUrl = payment.AuthorizationUrl,
            CancelledAt = payment.CancelledAt,
            Channel = payment.Channel,
            FailedAt = payment.FailedAt,
            SuccessfulAt = payment.SuccessfulAt,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt,
        };
    }
}