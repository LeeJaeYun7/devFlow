##### Web Service #####
# S3 버킷 (정적 웹 호스팅)
resource "aws_s3_bucket" "react_site" {
  bucket = "lia-react-site"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "react_site" {
  bucket = aws_s3_bucket.react_site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# CloudFront OAI
resource "aws_cloudfront_origin_access_identity" "react_site" {
  comment = "OAI for React S3"
}

# S3 버킷 정책 (CloudFront에서만 접근 허용)
data "aws_iam_policy_document" "react_site_policy" {
  statement {
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.react_site.arn}/*"]
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.react_site.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "react_site_policy" {
  bucket = aws_s3_bucket.react_site.id
  policy = data.aws_iam_policy_document.react_site_policy.json
} 
##### Web Service #####


##### Admin Service #####
resource "aws_s3_bucket" "admin_site" {
  bucket = "lia-admin-site"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "admin_site" {
  bucket = aws_s3_bucket.admin_site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_cloudfront_origin_access_identity" "admin_site" {
  comment = "OAI for Admin S3"
}

data "aws_iam_policy_document" "admin_site_policy" {
  statement {
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.admin_site.arn}/*"]
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.admin_site.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "admin_site_policy" {
  bucket = aws_s3_bucket.admin_site.id
  policy = data.aws_iam_policy_document.admin_site_policy.json
} 

##### Admin Service #####