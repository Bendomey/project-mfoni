namespace main.Lib;


/**
* This class is responsible for converting money from pesewas to cedis and vice versa
*
*/

public static class MoneyLib
{

    public static Int64 ConvertPesewasToCedis(Int64 pesewas)
    {
        return pesewas / 100;
    }

    public static Int64 ConvertCedisToPesewas(Int64 cedis)
    {
        return cedis * 100;
    }
}