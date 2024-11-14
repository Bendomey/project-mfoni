
namespace main.Lib;

public class EmailTemplates
{

    public static string VerifyAccountSubject = @"Verify Account";

    public static string VerifyPhoneNumberBody = @"Hello {name},
Your OTP is {code}. Please use this code to complete your action.

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string WaitlistSubject = "You're in! Welcome to the mfoni crew 📸";
    public static string WaitlistBody = @"
Hey there!

Guess what? You're now part of the mfoni fam! 🎉 Thanks for joining our waitlist.

What's coming your way:
• A cool new way to find and share Ghana's best photos
• Early access to the app (yep, you're VIP!)
• First dibs on some sweet launch deals

We're cooking up something awesome and can't wait to show you.

Spread the love! Tell your friends to join the waitlist at [Waitlist URL].

Got questions? Hit us up at info@mfoni.app.

Stay tuned and keep snapping!

The mfoni Team
P.S. Let's hang out on socials:
Twitter(https://twitter.com/mfoniapp)

#mfoniComingSoon #GhanaPhotography #SnapShareDiscover
    ";

    public static string NewAdminSubject = "Welcome to the mfoni crew 📸";

    public static string NewAdminBody = @"
Hey {name},

You can access the admin portal with these credentials:
Email: {email}
Password: {password}

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string CreatorApplicationApprovedSubject = "Your mfoni Creator Application has been approved! 🎉";

    public static string CreatorApplicationApprovedBody = @"
Hey {name},

Congratulations! Your mfoni Creator Application has been approved. 🎉

You can now start uploading your photos and earn money.

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string CreatorApplicationRejectedSubject = "Your mfoni Creator Application has been rejected";

    public static string CreatorApplicationRejectedBody = @"
Hey {name},

We regret to inform you that your mfoni Creator Application has been rejected.

Reason: {reason}

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string CreatorApplicationSubmittedSubject = "Your mfoni Creator Application has been submitted";

    public static string CreatorApplicationSubmittedBody = @"
Hey {name},

Your mfoni Creator Application has been submitted successfully. We'll review it and get back to you soon.

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string NewCreatorWithPremiumPackageButLowWalletSubject = "⚠️ Your mfoni package subscription needs your attention!";

    public static string NewCreatorWithPremiumPackageButLowWalletBody = @"
Hey {name},

You have insufficient funds in your wallet to activate your package. There are two ways to resolve this:

1. Top up your wallet with your mobile money.

2. Add a card to your account and we'll automatically deduct the amount from your account.

Visit https://mfoni.app/account/your-subscriptions to manage this. If you have any questions, please reach out to us on our website. 

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";
}
