#!/bin/bash

# AWS CLI를 통해 s3에 빌드된걸 업로드한 이후 CloudFront 캐시 무효화 진행
aws s3 cp ./dist/apps/web s3://lia-web-build --recursive
aws cloudfront create-invalidation --distribution-id E20250508000000 --paths "/*"
