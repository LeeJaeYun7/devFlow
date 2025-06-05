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

# 환경 변수
variable "MONGODB_URI" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
}

variable "OPENAI_API_KEY" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "GOOGLE_OAUTH_CLIENT_ID" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "GOOGLE_OAUTH_CLIENT_SECRET" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "KAKAO_OAUTH_CLIENT_ID" {
  description = "Kakao OAuth client ID"
  type        = string
  sensitive   = true
}

variable "OPENROUTER_URL" {
  description = "OpenRouter URL"
  type        = string
  sensitive   = true
}

variable "OPENROUTER_API_KEY" {
  description = "OpenRouter API key"
  type        = string
  sensitive   = true
}

variable "OPENROUTER_MODEL" {
  description = "OpenRouter model"
  type        = string
  sensitive   = true
}

variable "OPENROUTER_TEMPERATURE" {
  description = "OpenRouter temperature"
  type        = string
  sensitive   = true
}

variable "DART_API_KEY" {
  description = "Dart API key"
  type        = string
  sensitive   = true
}