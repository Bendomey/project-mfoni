using System.ComponentModel.DataAnnotations;

namespace main.DTOs;

public class CreateWaitlistInput
{
    public required string Name { get; set; }
    public required string PhoneNumber { get; set; }
    public string? Email { get; set; }

    [RegularExpression("^(CLIENT|CREATOR)$")]
    public required string UserType { get; set; }

    public override bool Equals(object? obj)
    {
        if (obj is not CreateWaitlistInput)
        {
            return false;
        }
        var objectAsWaitlistObject = (CreateWaitlistInput)obj;

        return this.Name == objectAsWaitlistObject.Name &&
        this.PhoneNumber == objectAsWaitlistObject.PhoneNumber &&
        this.Email == objectAsWaitlistObject.Email &&
        this.UserType == objectAsWaitlistObject.UserType;
    }

    public override int GetHashCode()
    {
        return base.GetHashCode();
    }
}