  resource "aws_ecs_cluster" "api" {
  name = "api-cluster"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "api-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      portMappings = [{ containerPort = 4600, hostPort = 4600 }]
      environment = [
        { name = "MONGODB_URI", value = var.MONGODB_URI },
        { name = "OPENAI_API_KEY", value = var.OPENAI_API_KEY },
        { name = "GOOGLE_OAUTH_CLIENT_ID", value = var.GOOGLE_OAUTH_CLIENT_ID },
        { name = "GOOGLE_OAUTH_CLIENT_SECRET", value = var.GOOGLE_OAUTH_CLIENT_SECRET },
        { name = "KAKAO_OAUTH_CLIENT_ID", value = var.KAKAO_OAUTH_CLIENT_ID },
        { name = "OPENROUTER_URL", value = var.OPENROUTER_URL },
        { name = "OPENROUTER_API_KEY", value = var.OPENROUTER_API_KEY },
        { name = "OPENROUTER_MODEL", value = var.OPENROUTER_MODEL },
        { name = "OPENROUTER_TEMPERATURE", value = var.OPENROUTER_TEMPERATURE }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = "ap-northeast-2"
          awslogs-stream-prefix = "api"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "wget -q --spider http://localhost:4600/api/health-check || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 30
      }
      linuxParameters: {
        tmpfs: [
          {
            containerPath: "/dev/shm",
            size: 1024,
            mountOptions: ["rw", "nosuid", "nodev"]
          }
        ]
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "api-service"
  cluster         = aws_ecs_cluster.api.id
  task_definition = aws_ecs_task_definition.api.arn
  launch_type     = "FARGATE"
  desired_count   = 1
  deployment_controller {
    type = "ECS"
  }
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.api_ecs.id]
    assign_public_ip = false
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 4600
  }
  depends_on = [aws_lb_listener.https]
}

resource "aws_security_group" "api_ecs" {
  name        = "api-ecs-sg"
  description = "Allow traffic from ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 4600
    to_port         = 4600
    protocol        = "tcp"
    security_groups = [aws_security_group.api_alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "local"
  description = "Private DNS namespace for service discovery"
  vpc         = aws_vpc.main.id
}

resource "aws_ecs_task_definition" "data_collector" {
  family                   = "data-collector-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "data-collector"
      image     = "${aws_ecr_repository.data_collector.repository_url}:latest"
      environment = [
        { name = "MONGODB_URI", value = var.MONGODB_URI }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.data_collector.name
          awslogs-region        = "ap-northeast-2"
          awslogs-stream-prefix = "data-collector"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "wget -q --spider http://localhost:4700/api/health-check || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 30
      }
    }
  ])
}

resource "aws_ecs_service" "data_collector" {
  name            = "data-collector-service"
  cluster         = aws_ecs_cluster.api.id
  task_definition = aws_ecs_task_definition.data_collector.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  deployment_controller {
    type = "ECS"
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.data_collector_ecs.id]
    assign_public_ip = false
  }
}

resource "aws_security_group" "data_collector_ecs" {
  name        = "data-collector-ecs-sg"
  description = "Security group for data collector ECS tasks"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
