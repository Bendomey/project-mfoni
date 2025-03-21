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
