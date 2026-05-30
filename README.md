# ScanOps — AI 기반 웹 취약점 자동 분석 플랫폼

> URL 하나로 웹사이트의 보안 취약점을 자동 탐지하고, AI가 한국어로 분석·해결책을 제공합니다.

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [상세설계](#2-상세설계)
3. [개발결과](#3-개발결과)
4. [설치 및 사용 방법](#4-설치-및-사용-방법)
5. [소개 및 시연 영상](#5-소개-및-시연-영상)
6. [팀 소개](#6-팀-소개)
7. [해커톤 참여 후기](#7-해커톤-참여-후기)

---

## 1. 프로젝트 소개

### 1.1. 개발 배경 및 필요성

중소기업·스타트업·개인 개발자는 보안 전문가를 고용할 여력이 없어 웹 취약점을 방치하는 경우가 많습니다. 기존 보안 스캐너(ZAP, Burp Suite)는 결과 리포트가 영문 기술 용어로 가득 차 있어 비전문가가 이해·대응하기 어렵습니다.

**ScanOps는 "URL 하나 입력하면 AI가 취약점을 찾아 한국어로 설명해준다"** 는 컨셉으로, 보안 지식이 없어도 즉시 사용할 수 있는 서비스를 목표로 합니다.

### 1.2. 개발 목표 및 주요 내용

- **자동 스캔**: URL 입력만으로 OWASP ZAP이 웹사이트를 크롤링·침투 테스트
- **AI 분석**: GPT-4o-mini / Claude / Gemini 폴백 라우팅으로 각 취약점의 원인·해결책을 한국어로 생성
- **CVSS 정량화**: 취약점별 CVSS 3.1 점수·벡터 자동 산출
- **보안 특화 LLM**: RAG + QLoRA 파인튜닝 모델로 코드 단위 취약점 탐지 (scanops-model)

### 1.3. 세부 내용

| 기능 | 설명 |
|------|------|
| 웹 취약점 스캔 | Spider(크롤링) → Active Scan(침투) 2단계 파이프라인 |
| AI 멀티 라우팅 | GPT → Claude → Gemini 순서로 폴백, 항상 분석 결과 보장 |
| CVSS 자동 산출 | SQL Injection 9.8 / XSS 6.1 등 취약점 유형별 점수·벡터 |
| 한국어 리포트 | 요약 / 상세 설명 / 해결 코드 스니펫을 한국어로 제공 |
| 보안 특화 모델 | NVD CVE 792개 + CWE 203개 파인튜닝 데이터로 코드 스캔 |
| 히스토리 관리 | 전체 스캔 이력 조회 및 리포트 재열람 |

### 1.4. 기존 서비스 대비 차별성

| 항목 | 기존 스캐너 (ZAP/Burp) | ScanOps |
|------|----------------------|---------|
| 진입 장벽 | CLI·GUI 설치 필요 | 브라우저에서 URL 입력 |
| 결과 언어 | 영문 기술 문서 | AI 생성 한국어 설명 |
| 해결책 | 링크·참고 문서 | 수정 코드 스니펫 직접 제공 |
| 비용 | 무료~수백만원 | API 비용만 발생 |
| 코드 스캔 | 미지원 | 보안 특화 LLM으로 소스코드 분석 |

### 1.5. 사회적 가치 도입 계획

- **보안 민주화**: 비전문가도 무료로 보안 점검 가능 → 소규모 서비스의 보안 수준 향상
- **AI 윤리**: 스캔 전 도메인 소유권 인증으로 악용 방지
- **오픈소스 생태계 기여**: OWASP ZAP + 오픈 LLM 기반으로 커뮤니티 공유 예정

---

## 2. 상세설계

### 2.1. 시스템 구성도

```
사용자 (Browser)
      │  URL 입력
      ▼
[Frontend] React + TypeScript + Vite
  Vercel 배포
      │  REST API
      ▼
[Backend] Spring Boot 3.2 + PostgreSQL
  Railway 배포
      │               │
      ▼               ▼
[ZAP 스캐너]     [AI 라우터]
Railway 배포     GPT-4o-mini
                 → Claude claude-sonnet-4-6
                 → Gemini
      │
      ▼
[scanops-model] 보안 특화 LLM
  Qdrant + Ollama (Qwen2.5-Coder-1.5B)
  RAG + QLoRA 파인튜닝
```

### 2.2. 사용 기술

**Frontend**

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안정성 |
| Vite | 6.x | 빌드 툴 |
| Tailwind CSS | v4 | 스타일링 |
| React Router | v6 | SPA 라우팅 |
| Recharts | - | 취약점 차트 시각화 |

**Backend**

| 기술 | 버전 | 용도 |
|------|------|------|
| Java | 17 | 런타임 |
| Spring Boot | 3.2.5 | 애플리케이션 프레임워크 |
| Spring Data JPA | - | PostgreSQL ORM |
| Spring WebFlux | - | ZAP·AI API 비동기 호출 |
| PostgreSQL | 15 | 메인 데이터베이스 |

**AI / Model**

| 기술 | 용도 |
|------|------|
| OpenAI GPT-4o-mini | 취약점 한국어 분석 (1순위) |
| Anthropic Claude claude-sonnet-4-6 | 폴백 AI (2순위) |
| Qwen2.5-Coder-1.5B (QLoRA) | 코드 취약점 탐지 특화 모델 |
| BAAI/bge-small-en-v1.5 | RAG 임베딩 |
| Qdrant | 벡터 DB (CVE/CWE 792개) |

**Infra**

| 기술 | 용도 |
|------|------|
| OWASP ZAP | 웹 취약점 스캐너 (Docker) |
| Docker Compose | 로컬 개발 환경 |
| Railway | 백엔드·ZAP 배포 |
| Vercel | 프론트엔드 배포 |

**활용한 생성형 AI 및 AI 코딩 도구**

- **Claude Code (Anthropic)**: 전체 개발 주기에서 AI 페어 프로그래밍 — 아키텍처 설계, 코드 생성, 디버깅, 리뷰
- **GPT-4o-mini**: 취약점 분석 리포트 한국어 생성 (프로덕션)
- **Claude claude-sonnet-4-6**: AI 라우터 폴백 모델
- **Cursor**: IDE 내 AI 자동완성

---

## 3. 개발결과

### 3.1. 전체 시스템 흐름도

```
[1] 사용자가 대상 URL 입력
        ↓
[2] Backend: ScanJob 생성 (status: PENDING)
        ↓
[3] ZAP: accessUrl → Spider 크롤링 → Active 스캔 (침투)
        ↓
[4] ZAP 알럿 수집 (취약점 목록)
        ↓
[5] CvssCalculator: 각 취약점에 CVSS 점수·벡터 산출
        ↓
[6] AiRouter: GPT → Claude → Gemini 순서로 한국어 분석 생성
        ↓
[7] PostgreSQL: vulnerabilities 테이블 저장 (status: DONE)
        ↓
[8] Frontend: 리포트 페이지에 결과 표시
```

### 3.2. 기능 설명

**랜딩 페이지 (`/`)**
- 서비스 소개 및 "스캔 시작" 버튼 제공
- 버튼 클릭 시 `/scan` 페이지로 이동

**스캔 요청 페이지 (`/scan`)**
- 대상 URL과 이메일 주소 입력
- 입력값 유효성 검사 후 스캔 생성 API 호출
- 스캔 생성 완료 시 상태 페이지로 자동 이동

**스캔 상태 페이지 (`/scan/:id/status`)**
- 3초 간격으로 스캔 진행 상태 폴링
- `PENDING → RUNNING → DONE` 상태 시각화
- 완료(`DONE`) 시 리포트 페이지로 자동 이동

**리포트 페이지 (`/report/:id`)**
- 위험등급별 취약점 분포 Pie 차트
- CVSS 점수 게이지 시각화
- 취약점 목록 테이블 (유형·URL·파라미터·위험도·점수)
- 각 취약점 클릭 시 AI 생성 한국어 설명·해결 코드 표시

**히스토리 페이지 (`/reports`)**
- 전체 스캔 이력 목록 조회
- 이전 스캔 리포트 재열람

### 3.3. 기능명세서

> 추후 노션 링크 또는 PDF 첨부 예정

### 3.4. 디렉토리 구조

```
scanops/                          ← 루트 (해커톤 제출 레포)
├── scanops-frontend/             ← React + TypeScript + Vite (FSD 아키텍처)
│   ├── src/
│   │   ├── app/                  라우터·앱 진입점
│   │   ├── pages/                라우트별 페이지 (landing, scan, report, reports)
│   │   ├── widgets/              복합 UI 블록 (vuln-table, vuln-chart)
│   │   ├── features/             유저 액션 단위 (scan-request)
│   │   ├── entities/             비즈니스 엔티티 (scan, vulnerability)
│   │   └── shared/               공통 유틸·UI (httpClient, CvssGauge)
│   └── ...
│
├── scanops-backend/              ← Spring Boot 3.2 + JPA
│   └── src/main/java/com/scanops/
│       ├── scan/                 스캔 생성·조회·ZAP 연동·파이프라인
│       ├── vulnerability/        취약점 엔티티·CVSS 계산
│       ├── ai/                   AI 분석 라우터 (GPT/Claude/Gemini)
│       ├── report/               스캔 리포트 조회
│       ├── verify/               도메인 소유권 인증
│       └── config/               CORS·보안·비동기 설정
│
├── scanops-model/                ← 보안 특화 LLM (RAG + QLoRA)
│   ├── scanops/
│   │   ├── core/                 scanner·rag·embedder 핵심 로직
│   │   ├── models/               QLoRA 파인튜닝·벤치마크
│   │   ├── data/                 NVD 전처리·Qdrant 적재
│   │   └── cli.py                CLI 진입점
│   └── data/
│       ├── nvdcve-2.0-preprocessed.json   CVE 792개 벡터DB 데이터
│       └── lora_train_v2.jsonl            CWE 203개 파인튜닝 데이터
│
└── scanops-infra/                ← Docker Compose + Railway ZAP
    ├── docker-compose.yml        ZAP + DVWA + PostgreSQL
    ├── Dockerfile.zap            Railway ZAP 배포용
    └── Dockerfile.dvwa           DVWA 커스텀 이미지
```

### 3.5. AI 도구 활용

| 단계 | 도구 | 활용 내용 | 성과 |
|------|------|-----------|------|
| 설계 | Claude Code | FSD 아키텍처 설계, DB 스키마 설계, AI 라우팅 전략 수립 | 초기 설계 시간 70% 단축 |
| 개발 | Claude Code + Cursor | Spring Boot 컨트롤러·서비스 코드 생성, React 컴포넌트 생성 | 개발 속도 3배 향상 |
| 디버깅 | Claude Code | ZAP 연동 오류, CORS 이슈, JPA 관계 매핑 디버깅 | 복잡한 에러 평균 15분 내 해결 |
| 모델 개발 | Claude Code | RAG 파이프라인 설계, QLoRA 파인튜닝 스크립트 작성 | 보안 특화 모델 2주 내 구축 |
| 프로덕션 | GPT-4o-mini / Claude | 취약점 한국어 분석 자동 생성 | 전문 보안 분석가 없이 서비스 운영 가능 |

---

## 4. 설치 및 사용 방법

### 사전 요구사항

- Docker & Docker Compose
- Node.js 20+
- Java 17+
- Python 3.10+
- Ollama

### 로컬 실행

**1. 인프라 실행 (ZAP + PostgreSQL + DVWA)**

```bash
cd scanops-infra
cp .env.example .env
docker compose up -d
```

**2. 백엔드 실행**

```bash
cd scanops-backend
export ZAP_HOST=http://localhost:8090
export ZAP_API_KEY=
export OPENAI_API_KEY=sk-...
./gradlew bootRun
```

**3. 프론트엔드 실행**

```bash
cd scanops-frontend
npm install
cp .env.example .env.local
# .env.local: VITE_API_BASE_URL=http://localhost:8080
npm run dev
```

**4. 보안 특화 모델 실행 (선택)**

```bash
cd scanops-model
pip install -e .
brew services start ollama
ollama pull qwen2.5-coder:1.5b
docker compose up -d   # Qdrant 실행
scanops db-prepare data/nvdcve-2.0-preprocessed.json
scanops scan ./your-code-directory/
```

### 환경변수 요약

| 서비스 | 변수 | 설명 |
|--------|------|------|
| Backend | `OPENAI_API_KEY` | OpenAI API 키 |
| Backend | `CLAUDE_API_KEY` | Anthropic API 키 |
| Backend | `ZAP_HOST` | ZAP 서비스 URL |
| Backend | `JDBC_DATABASE_URL` | PostgreSQL URL |
| Frontend | `VITE_API_BASE_URL` | 백엔드 API URL |

---

## 5. 소개 및 시연 영상

> 시연 영상 추후 업로드 예정 (YouTube URL 교육원 제출 후 기재)

---

## 6. 팀 소개

| 이름 | 역할 | 담당 |
|------|------|------|
| 김세한 | Frontend, AI Model |  React FSD 아키텍처, 리포트 UI, 차트 시각화, AI 모델 구현 |
| 전혜은 | Backend | Spring Boot 스캔 파이프라인, ZAP 연동 |
| 이경윤 | AI / Model, 보안| Neo4J RAG 파이프라인, QLoRA 파인튜닝, CVE 데이터 전처리 |
| 최효석 | UI/UX 점검, 마케팅 | Figma, UX 점검 |

> 연락처
      팀장 김세한 : 010-7722-3694      
---

## 7. 해커톤 참여 후기

> 팀원별 후기 작성 예정
