resource "aws_ssm_parameter" "backend_env" {
  name  = "/backend/env"
  type  = "SecureString"
  value = ""
}