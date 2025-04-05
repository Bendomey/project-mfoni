using main.Models;

namespace main.Lib;


public static class PermissionsHelper
{
    public static long? Unlimited = null;


    public static long? GetNumberOfUploadsForPackageType(string packageType)
    {
        switch (packageType)
        {
            case "FREE":
                return 50;
            case "BASIC":
                return 200;
            case "ADVANCED":
                return Unlimited;
            default:
                return 0;
        }
    }

    public static long? GetAmountYouCanWithdrawPerMonth(string packageType)
    {

        switch (packageType)
        {
            case "FREE":
                return 0;
            case "BASIC":
                return 200000; // GHS2,000.00
            case "ADVANCED":
                return Unlimited;
            default:
                return 0;
        }
    }

    public static string[] PremiumPackageTypes = new[]
    {
        CreatorSubscriptionPackageType.BASIC,
        CreatorSubscriptionPackageType.ADVANCED,
    };

    public static string[] FreePackageTypes = new[]
    {
        CreatorSubscriptionPackageType.FREE,
    };
}