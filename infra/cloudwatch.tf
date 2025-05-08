resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/api"
  retention_in_days = 30
} 