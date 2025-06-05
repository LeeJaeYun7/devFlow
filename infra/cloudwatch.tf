resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/api"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "data_collector" {
  name              = "/ecs/data_collector"
  retention_in_days = 14
}
