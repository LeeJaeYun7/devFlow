#!/bin/bash

REPO=731219764596.dkr.ecr.ap-northeast-2.amazonaws.com/backend
SHA_TAG=$(git rev-parse --short HEAD)

docker buildx build \
  --cache-from=type=local,src=/tmp/.buildx-cache \
  --cache-to=type=local,dest=/tmp/.buildx-cache \
  -t ${REPO}:latest \
  -f apps/backend/Dockerfile \
  .

docker tag ${REPO}:latest ${REPO}:${SHA_TAG}

docker push ${REPO}:${SHA_TAG}
docker push ${REPO}:latest
