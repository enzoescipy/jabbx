# 미니 트위터 (비밀 클럽 SNS)

> 겨울녹 수업 프로젝트 — 주연 주도 · 동효 기술 지원

## 1. 프로젝트 개요

친구들끼리만 사용할 수 있는 비밀 SNS. X(트위터)의 핵심 기능을 가져와서, 초대받은 사람만 접속할 수 있는 폐쇄형 타임라인 서비스를 만든다.

## 2. 핵심 기능

### 2.1 필수 기능 (MVP)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **포스트 작성** | 텍스트 글 올리기 | P0 |
| **타임라인** | 모든 포스트를 시간 역순으로 표시 | P0 |
| **회원가입 / 로그인** | 비밀번호 기반 인증 | P0 |
| **초대코드** | 초대코드를 아는 사람만 가입 가능 | P0 |

### 2.2 추가 기능 (MVP 이후)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **좋아요** | 포스트에 하트 누르기 | P1 |
| **프로필** | 닉네임, 자기소개, 아바타 | P1 |
| **답글** | 포스트에 답글 달기 | P2 |
| **이미지 업로드** | 포스트에 사진 첨부 | P2 |

## 3. 기술 스택

| 구성 요소 | 기술 | 비고 |
|-----------|------|------|
| **프레임워크** | Next.js (App Router) | 프론트엔드 + API 통합 |
| **ORM** | Prisma | 스키마 기반, 마이그레이션 지원 |
| **데이터베이스** | PostgreSQL | 관계형 데이터, Prisma와 찰떡 |
| **인증** | NextAuth.js (Credentials Provider) | 비밀번호 기반 세션 인증 |
| **배포** | 로컬 개발 우선 (`npm run dev`) | Docker는 추후 도커라이징 |

### 기술 스택 선정 이유

- **Next.js**: 프론트와 백엔드를 하나의 프로젝트에서 처리. 페이지 라우팅, API 라우트, SSR 모두 지원.
- **Prisma**: `schema.prisma` 파일에 데이터 구조를 직관적으로 정의. 타입 안전성 보장. 마이그레이션 명령어가 단순함 (`prisma migrate dev`).
- **PostgreSQL**: 관계형 데이터에 최적화. User-Post-Like 간의 관계를 자연스럽게 표현 가능.
- **NextAuth.js (Credentials)**: Firebase Auth는 누구나 가입 가능한 구조라 "비밀 클럽" 요구사항과 충돌. Credentials Provider로 비밀번호 기반 인증을 구현하고, 그 위에 초대코드 검증 로직을 얹는 구조가 요구사항에 부합.
- **Docker (추후)**: 초기 개발 단계에서는 로컬 개발에 집중. 서비스가 안정화된 후 컨테이너화하여 배포.

## 4. 데이터 모델

```prisma
// schema.prisma

model User {
  id         Int      @id @default(autoincrement())
  username   String   @unique
  password   String   // bcrypt 해시 저장
  inviteCode String?  // 가입 시 사용한 초대코드
  posts      Post[]
  likes      Like[]
  createdAt  DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  content   String
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  likes     Like[]
  createdAt DateTime @default(now())
}

model Like {
  id     Int  @id @default(autoincrement())
  userId Int
  postId Int
  user   User @relation(fields: [userId], references: [id])
  post   Post @relation(fields: [postId], references: [id])

  @@unique([userId, postId]) // 중복 좋아요 방지
}
```

## 5. 마일스톤

### Milestone 1: 뼈대 세우기
- Next.js 프로젝트 생성
- Prisma + PostgreSQL 연결
- `schema.prisma` 작성 및 마이그레이션
- 기본 레이아웃 (헤더, 타임라인 영역)

### Milestone 2: 포스트 + 타임라인
- 포스트 작성 폼 + API
- 타임라인 조회 API (시간 역순)
- 타임라인 UI 렌더링

### Milestone 3: 인증 + 초대코드
- NextAuth.js 설정 (Credentials Provider)
- 회원가입 페이지 (초대코드 검증 포함)
- 로그인 / 로그아웃
- 인증된 사용자만 타임라인 접근 가능

### Milestone 4: 좋아요 + 프로필
- 좋아요 토글 API
- 좋아요 카운트 표시
- 프로필 페이지 (내 포스트 모아보기)

## 6. 역할 분담

| 역할 | 담당자 | 내용 |
|------|--------|------|
| **클라이언트 / 기획** | 주연 | 요구사항 정의, UX 방향, 디자인 피드백 |
| **개발 / 기술** | 동효 | 구현, 기술 스택 관리, 코드 작성 |
| **기술 자문** | 위버 | 아키텍처 조언, 코드 리뷰, 트러블슈팅 |
