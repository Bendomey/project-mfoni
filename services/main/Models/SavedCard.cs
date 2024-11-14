using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace main.Models;

// All save cards - https://paystack.com/docs/payments/recurring-charges/#store-the-authorization
public class SavedCard
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; init; }

    [BsonElement("defaulted_at")]
    public DateTime DefaultedAt { get; set; }

    [BsonElement("authorization_code")]
    public required string AuthorizationCode { get; set; }

    [BsonElement("card_type")]
    public required string CardType { get; set; }

    [BsonElement("last4")]
    public required string Last4 { get; set; }

    [BsonElement("exp_month")]
    public required string exp_month { get; set; }

    [BsonElement("exp_year")]
    public required string exp_year { get; set; }

    [BsonElement("first_6")]
    public required string First6 { get; set; }

    [BsonElement("bank")]
    public required string Bank { get; set; }

    [BsonElement("channel")]
    public required string Channel { get; set; }

    [BsonElement("signature")]
    public required string Signature { get; set; }

    [BsonElement("reusable")]
    public required bool Reusable { get; set; }

    [BsonElement("country_code")]
    public required string CountryCode { get; set; }

    [BsonElement("account_name")]
    public required string AccountName { get; set; }

    // https://paystack.com/docs/payments/recurring-charges/#store-the-authorization:~:text=It%20is%20also%20important%20to%20store%20the%20email%20used%20to%20create%20an%20authorization%20because%20only%20the%20email%20used%20to%20create%20an%20authorization%20can%20be%20used%20to%20charge%20it.%20If%20you%20rely%20on%20the%20user%27s%20email%20stored%20on%20your%20system%20and%20the%20user%20changes%20it%2C%20the%20authorization%20can%20no%20longer%20be%20charged
    [BsonElement("email")]
    public required string Email { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
