# ACM 인증서 (us-east-1, CloudFront용)
resource "aws_acm_certificate" "cert" {
  provider                  = aws.virginia
  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = [var.www_domain_name]

  lifecycle {
    create_before_destroy = true
  }
}

# 인증서 검증용 Route53 레코드
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.selected.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.virginia
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}


# ACM 인증서 (us-east-1, CloudFront용, *.asklia.io)
resource "aws_acm_certificate" "cert_wildcard" {
  provider          = aws.virginia
  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_wildcard_validation" {
  for_each = {
    # for dvo in aws_acm_certificate.cert_wildcard.domain_validation_options : dvo.domain_name => {
    #   name   = dvo.resource_record_name
    #   type   = dvo.resource_record_type
    #   record = dvo.resource_record_value
    # }
  }

  zone_id = data.aws_route53_zone.selected.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert_wildcard" {
  provider                = aws.virginia
  certificate_arn         = aws_acm_certificate.cert_wildcard.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_wildcard_validation : record.fqdn]
}

# ACM 인증서 (ap-northeast-2, ALB용, api.asklia.io)
resource "aws_acm_certificate" "api_cert" {
  domain_name       = var.api_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.selected.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "api_cert" {
  certificate_arn         = aws_acm_certificate.api_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]
} 