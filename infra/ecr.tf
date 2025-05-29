resource "aws_ecr_repository" "backend" {
  name = "backend"
}

resource "aws_ecr_repository" "data_collector" {
  name = "data_collector"
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "최신 10개 이미지만 보관",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}


resource "aws_ecr_lifecycle_policy" "data_collector" {
  repository = aws_ecr_repository.data_collector.name

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "최신 10개 이미지만 보관",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}
