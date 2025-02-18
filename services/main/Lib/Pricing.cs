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
    private string _packageType;

    public PricingLib(string packageType)
    {
        _packageType = packageType;
    }

    public Int64 GetPrice()
    {
        switch (_packageType)
        {
            case "FREE":
                return 0;
            case "BASIC":
                return 5000;
            case "ADVANCED":
                return 10000;
            default:
                throw new HttpRequestException("InvalidPackageType");
        }
    }

    public long GetPricePerDay()
    {
        return GetPrice() / 30;
    }

    public string GetPackageName()
    {
        switch (_packageType)
        {
            case "FREE":
                return "Snap & Share";
            case "BASIC":
                return "Pro Lens";
            case "ADVANCED":
                return "Master Shot";
            default:
                throw new HttpRequestException("InvalidPackageType");
        }
    }

    public string DetermineIfItsAnUpgradeOrDowngrade(string newPackage)
    {
        string[] levels = { CreatorSubscriptionPackageType.FREE, CreatorSubscriptionPackageType.BASIC, CreatorSubscriptionPackageType.ADVANCED };

        int oldIndex = Array.IndexOf(levels, _packageType.ToUpper());
        int newIndex = Array.IndexOf(levels, newPackage.ToUpper());

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