#!/bin/bash

REPO=058264441782.dkr.ecr.ap-northeast-2.amazonaws.com/devflow
SHA_TAG=$GITHUB_SHA

docker buildx build \
  --progress=plain \
  --cache-from=type=local,src=/tmp/.buildx-cache \
  --cache-to=type=local,dest=/tmp/.buildx-cache \
  -t ${REPO}:latest \
  -t ${REPO}:${SHA_TAG} \
  -f apps/backend/Dockerfile \
  --push \
  .
  