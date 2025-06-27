# DevTrack

![PNPM](https://img.shields.io/badge/pnpm-9.15-orange?style=flat-square&logo=pnpm)
![Node.js](https://img.shields.io/badge/node.js-22.13-339933?style=flat-square&logo=node.js)
![Nx](https://img.shields.io/badge/nx-20.8-143055?style=flat-square&logo=nx)


# 디렉토리 구조
```
apps
├── backend  # 백엔드
└── web      # Web 서비스
libs
└── api      # API Dto 타입 공유를 위한 공용 라이브러리
infra        # 로컬 개발 환경 구성을 위한 docker-compose
```

# 초기 세팅

## 개발 환경 세팅
```bash
# 글로벌 패키지 설치
npm i -g pnpm@9.15
npm i -g nx@20.8

# 패키지 설치
pnpm i

# 인프라 구성
pnpm start:infra
```

## 서버 실행
```bash
# 개발 모드로 실행
nx serve backend
nx serve web

# 빌드
nx build backend
nx build web

# unit test 실행
nx test backend
nx test api
```

