
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    awscc = {
      source  = "hashicorp/awscc"
      version = "~> 0.67.0"
    }
  }

  backend "s3" {
    bucket                  = "mfoni-terraform-state"
    key                     = "mfoni"
    region                  = "us-east-1"
#   Remove before commit
    secret_key = "pdsFmWuAW4DYjiCR1GJOuRj0NItj0lvMU/mCB8o9"
    access_key = "AKIAZUIHPYJKJKJMX2ZR"
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
  secret_key = var.aws_secret_key
  access_key = var.aws_access_key
}

provider "awscc" {
  region = var.aws_region
  secret_key = var.aws_secret_key
  access_key = var.aws_access_key
}