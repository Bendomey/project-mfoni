variable "aws_region" {
  type = string
  default = "us-east-1"
}

variable "aws_secret_key" {
  type = string
}

variable "aws_access_key" {
  type = string
}

variable "mfoni_state_bucket_name" {
  type = string
  default = "mfoni-terraform-state"
}