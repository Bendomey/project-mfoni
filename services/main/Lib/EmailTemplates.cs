
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

You have insufficient funds in your wallet to activate your package. Fund your wallet to activate your package.

Visit https://mfoni.app/account/wallet to manage this. If you have any questions, please reach out to us on our website. 

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    // TODO: bring this back when we support card.

    //      public static string NewCreatorWithPremiumPackageButLowWalletBody = @"
    // Hey {name},

    // You have insufficient funds in your wallet to activate your package. There are two ways to resolve this:

    // 1. Top up your wallet with your mobile money.

    // 2. Add a card to your account and we'll automatically deduct the amount from your account.

    // Visit https://mfoni.app/account/your-subscriptions to manage this. If you have any questions, please reach out to us on our website. 

    // The mfoni Team
    // Twitter(https://twitter.com/mfoniapp)
    //     ";

    public static string RemindingSubscribersToTopupTheirWalletSubject = "🚨 Only {days} Day(s) Left to Renew – Top Up Your Wallet Today!";

    public static string RemindingSubscribersToTopupTheirWalletBody = @"
Hey {name},

We noticed your subscription is about to expire, and there are only {days} day(s) left until your next renewal on {renewalDate}. To ensure uninterrupted access to {package} package, please top up your wallet to cover the renewal fee.

Here's how to top up:
Log in to your account at https://mfoni.app/auth.
Navigate to the Wallet section.
Add funds securely using your preferred payment method.
Don’t wait until the last minute! Ensure your wallet has enough funds by {renewalDate} to continue enjoying {package} package without a hitch.

If you need assistance, feel free to reach out to our support team at support@mfoni.app.

Thank you for being a valued subscriber!

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string RemindingOverDueSubscribersToTopupTheirWalletSubject = "⚠️ Your Subscription is Overdue – Top Up Your Wallet Now!";

    public static string RemindingOverdueSubscribersToTopupTheirWalletBody = @"
Hey {name},

Your subscription renewal for {package} package was due on {renewalDate}, but it seems your wallet didn't have enough funds to process the payment.

To avoid service interruptions, please top up your wallet and renew your subscription as soon as possible.

Here’s how to resolve it quickly:
Log in to your account at https://mfoni.app/auth.
Go to the Wallet section.
Add funds securely using your preferred payment method.

Once your wallet is topped up, your subscription will be renewed automatically.

If you’ve already made a payment, it might take a few hours to reflect. Feel free to contact our support team at support@mfoni.app for any assistance.

We appreciate your prompt action and thank you for being a valued subscriber!

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string SuccessfulSubscriptionRenewalSubject = "🎉 Your Subscription Has Been Successfully Renewed!";

    public static string SuccessfulSubscriptionRenewalBody = @"
Hey {name},

Great news! Your subscription for {package} package has been successfully renewed on {renewalDate}. We’re excited to continue providing you with more ways to share your content!

Renewal Details:
Package: {package}
Renewal Amount: GH¢ {renewalAmount}
Next Renewal Date: {nextRenewalDate}

Thank you for ensuring your wallet was topped up. You’re all set for an uninterrupted access to {package} package.

If you have any questions or need further assistance, feel free to reach out to us at support@mfoni.app.

Thank you for being a valued member of our community!

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string FailedSubscriptionSubject = "⚠️ Subscription Renewal Failed – You've Been Moved to the Free Tier";

    public static string FailedSubscriptionBody = @"
Hey {name},

We attempted to renew your subscription for {package} package, but unfortunately, the payment could not be processed due to insufficient funds in your wallet.

As a result, your account has been moved to the Free Tier. While you can still enjoy limited access to mfoni, some premium benefits have been paused.

Want to Reactivate Your Subscription?
It’s easy to upgrade back to your premium plan:

Log in to your account at https://mfoni.app/auth.
Navigate to the Wallet section and top up your balance.
Once topped up, you can reactivate your subscription under the Plans section.

If you have any questions or need further assistance, feel free to reach out to us at support@mfoni.app.

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string CreatorSubscriptionCancelledSubject = "⚠️ Your Subscription Has Been Canceled – Access Until {expiryDate}";

    public static string CreatorSubscriptionCancelledBody = @"
Hey {name},

We’re writing to confirm that your subscription to {package} package has been successfully canceled as of {cancellationDate}.

While your subscription won’t renew, you’ll continue to enjoy all the benefits of {package} package until the end of your current billing period on {expiryDate}.

Here are the details of your cancellation:

- Subscription Package: {package}
- Cancellation Date: {cancellationDate}
- Access End Date: {expiryDate}

We’re sorry to see you go and hope you’ve enjoyed using mfoni. If there’s anything we can do to improve or help you reconsider, we’d love to hear from you!

If you have any questions or need further assistance, please don’t hesitate to reach out to our support team at support@mfoni.app.

Thank you for giving us the opportunity to serve you.

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string SuccessfulSubscriptionSubject = "Welcome! Your Subscription Is Confirmed";

    public static string SuccessfulSubscriptionBody = @"
Hey {name},

Thank you for subscribing to {package} package! We’re thrilled to have you join our community.

Here’s what you can expect:

Access: Your subscription is now active, giving you full access to {package} benefits.
Support: If you need assistance, our support team is here for you at support@mfoni.app.
Explore: Get started by https://mfoni.app.
Your Details:

Package: {package}
Subscription Start Date: {startDate}
Renews On: {renewalDate}
Amount Paid: GH¢ {renewalAmount}

We’re here to ensure you get the most out of your subscription. Don’t hesitate to reach out if you have questions or need help.

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string SuccessfulSubscriptionImmediateUpgradeSubject = "Your Upgrade to {package} is Active!";

    public static string SuccessfulSubscriptionImmediateUpgradeBody = @"
Hey {name},

Congratulations! Your upgrade to {package} package is now live and ready to use. 🎉

Here’s what you can enjoy right away:

Upgraded Features: https:/mfoni.app/#pricing.
Payment Details:

Upgrade Fee: GH¢ {upgradeAmount}
Effective Date: {effectiveDate}
Renewal Date: {renewalDate}

We’ve applied your balance toward the new plan, and you’ll now enjoy all the benefits of your upgraded package without delay.

If you have any questions about your upgrade or need further assistance, don’t hesitate to reach out to us at support@mfoni.app.

Thank you for choosing mfoni. We’re excited to support your journey!

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string SuccessfulSubscriptionScheduledUpgradeSubject = "Your Upgrade to {package} is Scheduled!";

    public static string SuccessfulSubscriptionScheduledUpgradeBody = @"
Hey {name},

Thank you for upgrading to {package} package! We’re thrilled to see you take this step with us.

Your new package will activate at the start of your next billing cycle:

Key Details:

Package Name: {package}
Activation Date: {nextRenewalDate}
New Monthly Fee: GH¢ {newMonthlyFee}

For now, you’ll continue to enjoy your current plan until {nextRenewalDate}. On that date, your account will seamlessly switch to the upgraded plan, giving you access to:

Enhanced Features: https://mfoni.app/#pricing

If you have any questions about your upgrade or billing, feel free to contact us at support@mfoni.app.

Thank you for choosing mfoni. We’re excited for you to experience the benefits of your upgraded package soon!

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

    public static string SuccessfulSubscriptionScheduledDowngradeSubject = "Your Downgrade to {package} is Scheduled!";

    public static string SuccessfulSubscriptionScheduledDowngradeBody = @"
Hey {name},

We’ve received your request to downgrade to {package} package, and we want to confirm the details for you.

Your current plan, {currentPackage} package, will remain active until the end of your current billing cycle, which you’ve already paid for. Starting on {nextRenewalDate}, your account will switch to the downgraded plan.

What to Expect:

Until {currentCycleEndDate}: You’ll continue to enjoy all the benefits of your current plan.
Starting {nextRenewalDate}: Your account will move to the {package} package.

New Billing Amount: GH¢ {newMonthlyFee}

If you have any questions or would like to make further changes to your account, feel free to contact us at support@mfoni.app.

Thank you for choosing mfoni. We’re here to support you every step of the way!

The mfoni Team
Twitter(https://twitter.com/mfoniapp)
    ";

}
