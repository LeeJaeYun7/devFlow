resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "main" }
}

resource "aws_vpc_endpoint" "ssm" {
  vpc_id             = aws_vpc.main.id
  service_name       = "com.amazonaws.ap-northeast-2.ssm"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.api_ecs.id]
}

resource "aws_vpc_endpoint" "ssm_messages" {
  vpc_id             = aws_vpc.main.id
  service_name       = "com.amazonaws.ap-northeast-2.ssmmessages"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.api_ecs.id]
}

resource "aws_vpc_endpoint" "ec2_messages" {
  vpc_id             = aws_vpc.main.id
  service_name       = "com.amazonaws.ap-northeast-2.ec2messages"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.api_ecs.id]
}
