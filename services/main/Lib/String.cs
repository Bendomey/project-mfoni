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
}