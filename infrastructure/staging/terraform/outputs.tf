output "TerraformStateBucket" {
    value = "${aws_s3_bucket.terraform_state_bucket.id}"
}

output "StagingMfoniS3ID" {
    value = "${aws_s3_bucket.staging_mfoni_bucket.id}"
}

output "StagingMfoniRekognitionCollection" {
    value = "${awscc_rekognition_collection.mfoni_staging_collection.collection_id}"
}