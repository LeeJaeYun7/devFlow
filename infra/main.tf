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

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}
