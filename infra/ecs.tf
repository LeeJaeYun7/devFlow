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
        { name = "OPENAI_API_KEY", value = var.OPENAI_API_KEY }
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
        command     = ["CMD-SHELL", "curl -f http://localhost:4600/api/health-check || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 10
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

resource "aws_security_group" "mongo_ecs" {
  name        = "mongo-ecs-sg"
  description = "Allow backend ECS to access MongoDB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.api_ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_task_definition" "mongo" {
  family                   = "mongo-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "mongodb"
      image     = "mongo:latest"
      portMappings = [{ containerPort = 27017, hostPort = 27017 }]
      environment = [
        { name = "MONGO_INITDB_ROOT_USERNAME", value = "root" },
        { name = "MONGO_INITDB_ROOT_PASSWORD", value = "password" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.mongo.name
          awslogs-region        = "ap-northeast-2"
          awslogs-stream-prefix = "mongo"
        }
      }
    }
  ])
}

resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "local"
  description = "Private DNS namespace for service discovery"
  vpc         = aws_vpc.main.id
}

resource "aws_service_discovery_service" "mongo" {
  name = "mongodb"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_ecs_service" "mongo" {
  name            = "mongo-service"
  cluster         = aws_ecs_cluster.api.id
  task_definition = aws_ecs_task_definition.mongo.arn
  launch_type     = "FARGATE"
  desired_count   = 1
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.mongo_ecs.id]
    assign_public_ip = false
  }
  service_registries {
    registry_arn = aws_service_discovery_service.mongo.arn
  }
}

