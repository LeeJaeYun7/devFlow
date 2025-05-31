#!/bin/bash

REPO=731219764596.dkr.ecr.ap-northeast-2.amazonaws.com/backend
SHA_TAG=$(git rev-parse --short HEAD)

docker buildx build \
  --progress=plain \
  --cache-from=type=local,src=/tmp/.buildx-cache \
  --cache-to=type=local,dest=/tmp/.buildx-cache \
  -t ${REPO}:latest \
  -t ${REPO}:${SHA_TAG} \
  -f apps/backend/Dockerfile \
  --push \
  .
  
## 배포 후, ECS Task 재시작
CLUSTER_NAME=api-cluster
SERVICE_NAME=api-service
REGION=ap-northeast-2

aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --region $REGION
