using main.Models;

namespace main.Lib;


/**
* This class is responsible for pricing logic
*
* Pricing:
* Free - GHS 0.00
* Basic - GHS 50.00
* Advanced - GHS 100.00
*/

public class PricingLib
{

    public static long GetPricePerDay(Int64 amount)
    {
        return amount / 30;
    }

    public static string DetermineIfItsAnUpgradeOrDowngrade(string oldPackage, string newPackage)
    {
        string[] levels = { MfoniPackageCode.FREE, MfoniPackageCode.BASIC, MfoniPackageCode.ADVANCED };

        int oldIndex = Array.IndexOf(levels, oldPackage);
        int newIndex = Array.IndexOf(levels, newPackage);

        if (oldIndex == -1 || newIndex == -1)
        {
            throw new Exception("InvalidPackageType");
        }

        if (newIndex > oldIndex)
        {
            return "UPGRADE";
        }
        else if (newIndex < oldIndex)
        {
            return "DOWNGRADE";
        }
        else
        {
            return "NO_CHANGE";
        }
    }
}