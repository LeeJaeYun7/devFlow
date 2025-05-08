terraform {
  cloud {
    organization = "team-lia"
    workspaces {
      name = "Lia"
    }
  }
}

provider "aws" {
  region = "ap-northeast-2"
}

resource "aws_ecr_repository" "backend" {
  name = "backend"
} 