resource "aws_s3_bucket" "terraform_state_bucket" {
    bucket = var.mfoni_state_bucket_name

    tags = {
        Description = "Hold terraform state files. Cannot be deleted"
    }

    lifecycle {
        prevent_destroy = true
    }
}

resource "aws_s3_bucket" "staging_mfoni_bucket" {
    bucket = "staging-mfoni"

    tags = {
        Name        = "Mfoni Media"
        Environment = "Staging"
    }
}

resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.staging_mfoni_bucket.id
}

resource "aws_s3_bucket_cors_configuration" "staging_mfoni_bucket_cors" {
  bucket = aws_s3_bucket.staging_mfoni_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}