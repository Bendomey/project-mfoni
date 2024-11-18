using System.Net;

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
}