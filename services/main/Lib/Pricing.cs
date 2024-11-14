using System.Net;

namespace main.Lib;

public class PricingLib
{
    private string _packageType;

    public PricingLib(string packageType)
    {
        _packageType = packageType;
    }

    public double GetPrice()
    {
        switch (_packageType)
        {
            case "FREE":
                return 0;
            case "BASIC":
                return 50;
            case "ADVANCED":
                return 100;
            default:
                throw new HttpRequestException("InvalidPackageType");
        }
    }
}