terraform {
  required_version = ">= 1.0.0, <2.0.0"
  required_providers {
    aws = {
        source  = "hashicorp/aws"
        version = "~>5.82"
    }
  }
}

provider "aws" {
    profile = var.aws_profile
    region  = "us-east-1"
}
