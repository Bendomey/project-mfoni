using main.Configurations;

namespace main.Domains;


public class WalletBaseInput
{
    // Pass SYSTEM as UserId to perform an operation to save transactions in Admin Wallet
    public required string UserId { get; set; }
    public required Int64 Amount { get; set; }
    public required string ReasonForTransfer { get; set; }
}

public class WalletWithdrawInput : WalletBaseInput
{
}

public class WalletDepositInput : WalletBaseInput
{
    public string? WalletTransactionId { get; set; }
    public string? PaymentId { get; set; }
}


public class SubscribeWithWalletInput
{
    public required Int64 Amount { get; set; }
    public required string SubscriptionId { get; set; }
    public required string UserId { get; set; }
}

public class GetWalletTransactionsInput
{
    public required string UserId { get; set; }
    public string? Type { get; set; }
    public string? Search { get; set; }
}

public class GetSubscriptionsInput
{
    public required string CreatorId { get; set; }
    public string? PackageType { get; set; }
}

public class CalculateUpgradePricingOutput
{
    public required Int64 Pricing { get; set; }
    public required Int64 RemainingAmount { get; set; }
}

public class InitializePaymentInput
{
    public required string Origin { get; set; }
    public string? ContentPurchaseId { get; set; }
    public string? WalletId { get; set; }
    public required InitPaymentInput PaystackInput { get; set; }
}

public class CreateTransferRecipientInput
{
    public required string CreatedById { get; set; }
    public required string Type { get; set; }
    public required string RecipientCode { get; set; }
    public string? Currency { get; set; }
    public required string AccountNumber { get; set; }
    public required string AccountName { get; set; }
    public required string BankName { get; set; }
    public required string BankCode { get; set; }
}


public class DeleteTransferRecipientInput
{
    public required string CreatedById { get; set; }
    public required string TransferRecipientId { get; set; }
}


public class GetTransferRecipienstInput
{
    public string? CreatedById { get; set; }
    public string? BankCode { get; set; }
}
