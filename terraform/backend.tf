terraform {
  backend "s3" {
    encrypt = true
    bucket  = "tf-neon-bot-terraform-remote-state"
    key     = "neon-bot/terraform.tfstate"
    region  = "us-east-1"
  }
}