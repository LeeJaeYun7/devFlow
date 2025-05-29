# 베이스 이미지
FROM node:22.13-alpine AS base

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm@9.15

# 패키지 파일 복사 및 의존성 설치
COPY apps/data-collector/dist/pnpm-lock.yaml ./
COPY apps/data-collector/dist/package.json ./
RUN pnpm install --prod --frozen-lockfile

# 프로덕션 이미지
FROM node:22.13-alpine AS prod

ENV NODE_ENV=production
ENV PORT=4700

WORKDIR /app

RUN addgroup --system data-collector && \
  adduser --system -G data-collector data-collector

COPY apps/data-collector/dist data-collector/
COPY --from=base /app/node_modules ./node_modules
RUN chown -R data-collector:data-collector .

EXPOSE 4700

ENTRYPOINT [ "node", "data-collector" ]
