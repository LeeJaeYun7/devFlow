#!/bin/bash

# AWS CLI를 통해 s3에 빌드된걸 업로드한 이후 CloudFront 캐시 무효화 진행
aws s3 cp ./apps/admin/dist s3://lia-admin-site --recursive
aws cloudfront create-invalidation --distribution-id E38H8DXFQMEHV --paths "/*"
