using System.Net;

namespace main.Lib;

public static class StringLib
{
    public static string Base64Encode(string plainText)
    {
        var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
        return Convert.ToBase64String(plainTextBytes);
    }

    public static string NormalizePhoneNumber(string phoneNumber)
    {
        if (phoneNumber.Length < 10)
        {
            throw new HttpRequestException("PhoneNumber is invalid", null, HttpStatusCode.UnprocessableEntity);
        }

        var last9Digits = phoneNumber.Substring(phoneNumber.Length - 9);
        return "233" + last9Digits;
    }

    public static string SafeString(string? input)
    {
        return input ?? "";
    }

    public static string normalizePaystackChannel(string channel)
    {
        if (channel == "ussd")
        {
            return "USSD";
        }
        else if (channel == "bank")
        {
            return "Bank";
        }
        else if (channel == "card")
        {
            return "Card";
        }
        else if (channel == "qr")
        {
            return "QR";
        }
        else if (channel == "mobile_money")
        {
            return "Mobile Money";
        }
        else if (channel == "bank_transfer")
        {
            return "Bank Transfer";
        }
        else if (channel == "wallet")
        {
            return "Wallet";
        }
        else
        {
            return "Unknown";
        }
    }
}