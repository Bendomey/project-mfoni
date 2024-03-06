using System.Text.Json.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace main.DTOs;

public static class IdentityVerificationInputStatus
{
    public static readonly string SUCCESSFUL = "SUCCESSFUL";
    public static readonly string FAILED = "FAILED";
}

public class IdentityVerificationInput
{
    [JsonPropertyName("transactionnumber")]
    [BsonElement("transaction_number")]
    public required string TransactionNumber { get; set; }

    [JsonPropertyName("pictureMatchScore")]
    [BsonElement("picture_match_score")]
    public required string PictureMatchScore { get; set; }

    [JsonPropertyName("livenessverificationscore")]
    [BsonElement("liveness_verification_score")]
    public required string LivenessVerificationScore { get; set; }

    [JsonPropertyName("dateOfBirthMatchScore")]
    [BsonElement("date_of_birth_match_score")]
    public string? DateOfBirthMatchScore { get; set; }

    [JsonPropertyName("nameMatchScore")]
    [BsonElement("name_match_score")]
    public string? NameMatchScore { get; set; }

    [JsonPropertyName("originalImageURI")]
    [BsonElement("image")]
    public required string Image { get; set; }

    [JsonPropertyName("overAllComparismScore")]
    [BsonElement("overall_comparism_score")]
    public string? OverAllComparismScore { get; set; }

    [JsonPropertyName("status")]
    [BsonElement("status")]
    public required string Status { get; set; } // SUCCESSFUL / FAILED

    [JsonPropertyName("referenceid")]
    [BsonElement("reference_id")]
    public required string ReferenceId { get; set; }

    [JsonPropertyName("idNumber")]
    [BsonElement("id_number")]
    public required string IdNumber { get; set; }

    [JsonPropertyName("verification_result")]
    [BsonElement("verification_result")]
    public VerificationResult? VerificationResult { get; set; }
}

public class VerificationResult
{
    [JsonPropertyName("success")]
    [BsonElement("success")]
    public required bool Success { get; set; }

    [JsonPropertyName("code")]
    [BsonElement("code")]
    public required string Code { get; set; }

    [JsonPropertyName("subcode")]
    [BsonElement("subcode")]
    public string? SubCode { get; set; }

    [JsonPropertyName("msg")]
    [BsonElement("msg")]
    public required string Msg { get; set; }

    [JsonPropertyName("error")]
    [BsonElement("error")]
    public string? Error { get; set; }

    [JsonPropertyName("nationalId")]
    [BsonElement("national_id")]
    public required string NationalId { get; set; }
}


public class SmileIdentityVerificationInput
{
    [JsonPropertyName("Actions")]
    [BsonElement("actions")]
    public SmileIdentityVerificationInputActions? Actions { get; set; } // TODO: comeback and type this.

    [JsonPropertyName("Country")]
    [BsonElement("country")]
    public string? Country { get; set; }
    
    [JsonPropertyName("IDNumber")]
    [BsonElement("id_number")]
    public string? IDNumber { get; set; }

     [JsonPropertyName("IDType")]
    [BsonElement("id_type")]
    public string? IDType { get; set; }

    [JsonPropertyName("ImageLinks")]
    [BsonElement("image_links")]
    public SmileIdentityVerificationInputImageLink? ImageLinks { get; set; }

    [JsonPropertyName("KYCReceipt")]
    [BsonElement("kyc_receipt")]
    public string? KYCReceipt { get; set; }

    [JsonPropertyName("PartnerParams")]
    [BsonElement("partner_params")]
    public SmileIdentityVerificationInputPartnerParams? PartnerParams { get; set; }

    [JsonPropertyName("ResultCode")]
    [BsonElement("result_code")]
    public required string ResultCode { get; set; }

    [JsonPropertyName("ResultText")]
    [BsonElement("result_text")]
    public required string ResultText { get; set; }

    [JsonPropertyName("signature")]
    [BsonElement("signature")]
    public required string Signature { get; set; }

    [JsonPropertyName("SmileJobID")]
    [BsonElement("smile_job_id")]
    public required string SmileJobID { get; set; }
}

public class SmileIdentityVerificationInputImageLink
{
    [JsonPropertyName("selfie_image")]
    [BsonElement("selfie_image")]
    public required string SelfieImage { get; set; }

}

public class SmileIdentityVerificationInputPartnerParams
{
    [JsonPropertyName("job_id")]
    [BsonElement("job_id")]
    public required string JobId { get; set; }

    [JsonPropertyName("job_type")]
    [BsonElement("job_type")]
    public required int JobType { get; set; }

    [JsonPropertyName("user_id")]
    [BsonElement("user_id")]
    public required string UserId { get; set; }
}

public class SmileIdentityVerificationInputActions
{
    [JsonPropertyName("Return_Personal_Info")]
    [BsonElement("return_personal_info")]
    public string? ReturnPersonalInfo { get; set; }

    [JsonPropertyName("Verify_ID_Number")]
    [BsonElement("verify_id_number")]
    public string? VerifyIDNumber { get; set; }

    [JsonPropertyName("Human_Review_Compare")]
    [BsonElement("human_review_compare")]
    public string? HumanReviewCompare { get; set; }

    [JsonPropertyName("Human_Review_Liveness_Check")]
    [BsonElement("human_review_liveness_check")]
    public string? HumanReviewLivenessCheck { get; set; }

    [JsonPropertyName("Human_Review_Update_Selfie")]
    [BsonElement("human_review_update_check")]
    public string? HumanReviewUpdateCheck { get; set; }

    [JsonPropertyName("Liveness_Check")]
    [BsonElement("liveness_check")]
    public string? LivenessCheck { get; set; }

    [JsonPropertyName("Register_Selfie")]
    [BsonElement("register_selfie")]
    public string? RegisterSelfie { get; set; }

    [JsonPropertyName("Selfie_Check")]
    [BsonElement("selfie_check")]
    public string? SelfieCheck { get; set; }

    [JsonPropertyName("Selfie_Provided")]
    [BsonElement("selfie_provided")]
    public string? SelfieProvided { get; set; }

    [JsonPropertyName("Selfie_To_ID_Authority_Compare")]
    [BsonElement("selfie_to_id_authority_compare")]
    public string? SelfieToIDAuthorityCompare { get; set; }

    [JsonPropertyName("Selfie_To_Registered_Selfie_Compare")]
    [BsonElement("selfie_to_registered_selfie_compare")]
    public string? SelfieToRegisteredSelfieCompare { get; set; }

    [JsonPropertyName("Selfie_To_ID_Card_Compare")]
    [BsonElement("selfie_to_id_card_compare")]
    public string? SelfieToIDCardCompare { get; set; }

    [JsonPropertyName("Update_Registered_Selfie_On_File")]
    [BsonElement("update_registered_selfie_on_file")]
    public string? UpdateRegisteredSelfieOnFile { get; set; }
}