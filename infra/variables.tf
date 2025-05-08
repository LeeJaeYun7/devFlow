variable "domain_name" {
  description = "메인 도메인명"
  type        = string
  default     = "asklia.io"
}

variable "www_domain_name" {
  description = "www 서브도메인명"
  type        = string
  default     = "www.asklia.io"
}

variable "api_domain_name" {
  description = "API 백엔드 도메인명"
  type        = string
  default     = "api.asklia.io"
}

variable "backend_ecr_repo" {
  description = "백엔드 ECR 리포지토리명"
  type        = string
  default     = "backend"
} 
