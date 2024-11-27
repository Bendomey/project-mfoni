using main.Domains;
using main.DTOs;
using main.Models;

namespace main.Transformations;

public class WalletTransactionTransformer
{
    public WalletTransactionTransformer() { }

    public OutputWalletTransaction Transform(WalletTransaction transaction)
    {
        // OutputCreator? outputCreator = null;
        // if (user. is not null)
        // {
        //     var createdBy = _adminService.GetAdminById(user.CreatedById);
        //     if (createdBy is not null)
        //     {
        //         outputCreatedByAdmin = Transform(createdBy);
        //     }
        // }

        return new OutputWalletTransaction
        {
            Id = transaction.Id,
            Type = transaction.Type,
            Amount = transaction.Amount,
            ReasonForTransfer = transaction.ReasonForTransfer,
            CreatedAt = transaction.CreatedAt,
            UpdatedAt = transaction.UpdatedAt,
        };
    }
}
