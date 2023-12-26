
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

    # FIXME: use aws credentials instead of vars
    secret_key = var.aws_secret_key
    access_key = var.aws_access_key
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  # FIXME: use aws credentials instead of vars
  secret_key = var.aws_secret_key
  access_key = var.aws_access_key
}

provider "awscc" {
  region = var.aws_region

  # FIXME: use aws credentials instead of vars
  secret_key = var.aws_secret_key
  access_key = var.aws_access_key
}