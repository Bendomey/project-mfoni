namespace main.Lib;

public class CanInput
{
    public required string Action { get; set; }
    public required string[] Permissions { get; set; }
}


public static class PermissionsHelper
{
    public static bool Can(CanInput input)
    {
        return input.Permissions.Contains(input.Action);
    }

    public static string[] GetPermissionsForPackageType(string packageType)
    {
        switch (packageType)
        {
            case "FREE":
                return new string[]{
                    Permissions.UploadContent
                };
            case "BASIC":
                return new string[]{
                    Permissions.UploadContent
                };
            case "ADVANCED":
                return new string[]{
                    Permissions.UploadContent
                };
            default:
                return new string[] { };
        }
    }

    public static long GetNumberOfUploadsForPackageType(string packageType)
    {
        switch (packageType)
        {
            case "FREE":
                return 50;
            case "BASIC":
                return 200;
            case "ADVANCED":
                return long.MaxValue;
            default:
                return 0;
        }
    }
}