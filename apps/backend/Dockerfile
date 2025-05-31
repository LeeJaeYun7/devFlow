# 베이스 이미지
FROM node:22.13-alpine AS base

WORKDIR /app

# Chromium 설치
RUN apk add --no-cache chromium \
    && echo "🔍 chromium-browser 위치:" \
    && which chromium-browser || echo "❌ chromium-browser not found" \
    && which chromium || echo "❌ chromium not found" \
    && find /usr -name chromium* || echo "❌ chromium 경로 찾기 실패"

# pnpm 설치
RUN npm install -g pnpm@9.15

# 패키지 파일 복사 및 의존성 설치
COPY apps/backend/dist/pnpm-lock.yaml ./
COPY apps/backend/dist/package.json ./
RUN pnpm install --prod --frozen-lockfile

# 프로덕션 이미지
FROM node:22.13-alpine AS prod

ENV NODE_ENV=production
ENV PORT=4600

WORKDIR /app

RUN addgroup --system backend && \
  adduser --system -G backend backend

COPY apps/backend/dist backend/
COPY --from=base /app/node_modules ./node_modules
RUN chown -R backend:backend .

EXPOSE 4600

ENTRYPOINT [ "node", "backend" ]
