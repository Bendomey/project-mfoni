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

resource "aws_s3_bucket_policy" "staging_mfoni_bucket_policy" {
  bucket = aws_s3_bucket.staging_mfoni_bucket.id

  policy = <<EOF
  {
    "Version": "2012-10-17",
    "Id": "Policy1587616289547",
    "Statement": [
      {
        "Sid": "Stmt1587616287547",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::staging-mfoni/*",
        "Condition": {
          "IpAddress": {
            "aws:SourceIp": [
              "173.245.48.0/20",
              "103.21.244.0/22",
              "103.22.200.0/22",
              "103.31.4.0/22",
              "141.101.64.0/18",
              "108.162.192.0/18",
              "190.93.240.0/20",
              "188.114.96.0/20",
              "197.234.240.0/22",
              "198.41.128.0/17",
              "162.158.0.0/15",
              "104.16.0.0/13",
              "104.24.0.0/14",
              "172.64.0.0/13",
              "131.0.72.0/22",
              "2400:cb00::/32",
              "2606:4700::/32",
              "2803:f800::/32",
              "2405:b500::/32",
              "2405:8100::/32",
              "2a06:98c0::/29",
              "2c0f:f248::/32"
            ]
          }
        }
      }
    ]
  }
  EOF
}

resource "aws_s3_bucket_cors_configuration" "staging_mfoni_bucket_cors" {
  bucket = aws_s3_bucket.staging_mfoni_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["https://staging-images.mfoni.app", "https://staging.mfoni.app"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}