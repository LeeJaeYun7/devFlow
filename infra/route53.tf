# Route53 도메인 정보
data "aws_route53_zone" "selected" {
  name         = "${var.domain_name}."
  private_zone = false
}

# Route53 A 레코드 (CloudFront 연결)
resource "aws_route53_record" "react_site" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.react_site.domain_name
    zone_id                = aws_cloudfront_distribution.react_site.hosted_zone_id
    evaluate_target_health = false
  }
}

# www 서브도메인도 연결
resource "aws_route53_record" "react_site_www" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = var.www_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.react_site.domain_name
    zone_id                = aws_cloudfront_distribution.react_site.hosted_zone_id
    evaluate_target_health = false
  }
}

# API용 Route53 A 레코드 (ALB 연결)
resource "aws_route53_record" "api_alb" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = var.api_domain_name
  type    = "A"

  alias {
    name                   = aws_lb.api.dns_name
    zone_id                = aws_lb.api.zone_id
    evaluate_target_health = true
  }
} 