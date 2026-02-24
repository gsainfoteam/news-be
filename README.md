# 지스트신문 Backend

## 스택

- **Framework**: NestJS
- **ORM**: Prisma (CRUD) + Drizzle 
- **DB**: PostgreSQL
- **API Docs**: Swagger (`/docs`)

## 시작하기

```bash
# 1. 설치 및 DB 세팅
npm install
npm run prisma:generate
npm run prisma:push

# 2. 실행
npm run start:dev
```

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/articles` | 기사 목록 (검색: `?query=`, `?category=`, `?limit=`, `?offset=`) |
| GET | `/articles/categories` | 카테고리 목록 |
| GET | `/articles/:id` | 기사 상세 |
| POST | `/articles` | 기사 생성 |
| PATCH | `/articles/:id` | 기사 수정 |
| DELETE | `/articles/:id` | 기사 삭제 |
| GET | `/health` | 서버 상태 |

Swagger UI: `http://localhost:3001/docs`
