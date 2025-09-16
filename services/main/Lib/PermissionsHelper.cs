using main.Models;

namespace main.Lib;


public static class PermissionsHelper
{
    public static long? Unlimited = null;


    public static long? GetNumberOfUploadsForPackageType(string packageType)
    {
        switch (packageType)
        {
            case "MfoniPackage.Free":
                return 50;
            case "MfoniPackage.Basic":
                return 200;
            case "MfoniPackage.Advanced":
                return Unlimited;
            default:
                return 0;
        }
    }

    public static long? GetAmountYouCanWithdrawPerMonth(string packageType)
    {

        switch (packageType)
        {
            case "MfoniPackage.Free":
                return 0;
            case "MfoniPackage.Basic":
                return 200000; // GHS2,000.00
            case "MfoniPackage.Advanced":
                return Unlimited;
            default:
                return 0;
        }
    }

    public static string[] PremiumPackageTypes = new[]
    {
        MfoniPackageCode.BASIC,
        MfoniPackageCode.ADVANCED,
    };

    public static string[] FreePackageTypes = new[]
    {
        MfoniPackageCode.FREE,
    };
}