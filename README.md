# ScanOps — PR 자동 보안 분석 & AI 취약점 진단 플랫폼

> 부산대학교 2026 AI 해커톤 · 창업트랙(C) 3조 · 팀 **ScanOps**

[![GitHub App](https://img.shields.io/badge/GitHub%20App-설치하기-238636?logo=github)](https://github.com/apps/scanops-security-scanner)

PR을 올리면 자동으로 소스코드의 보안 취약점을 분석하고, CVE·CWE·CVSS 근거와 수정 가이드를 한국어로 코드 라인에 바로 달아주는 **개발자 친화 보안 진단 서비스**입니다.

---

## 1. 프로젝트 소개

### 1.1. 개발배경 및 필요성
- 보안 취약점 점검은 보통 개발이 끝난 뒤 별도 진단 단계에서 이루어져, 발견 시점이 늦고 수정 비용이 큽니다.
- 기존 SAST/DAST 도구는 결과가 영어·전문 용어 위주라 비(非)보안 개발자가 곧바로 조치하기 어렵습니다.
- "코드를 작성하는 흐름 안에서" 취약점을 짚어주고, **무엇이·왜 문제이며·어떻게 고치는지**까지 알려주는 도구가 필요했습니다.

### 1.2. 개발 목표 및 주요 내용
- GitHub PR 단계에서 자동으로 동작하는 **보안 특화 코드 리뷰어**를 만든다.
- OWASP ZAP 기반 동적 스캔과 자체 파인튜닝 LLM(QLoRA) + RAG 기반 정적 분석을 결합한다.
- 발견된 취약점에 **CVE / CWE / CVSS 점수 / 한국어 수정 가이드**를 함께 제공한다.
- 결과를 대시보드와 PDF 리포트로 시각화한다.

### 1.3. 세부내용
- **PR 자동 분석:** GitHub App을 레포에 설치하면 PR마다 Webhook이 백엔드로 전달되고, 변경된 코드가 AI 모델 서버로 라우팅되어 분석됩니다. XSS·코드 인젝션·SSRF 등 취약점이 발견되면 해당 코드 라인에 인라인 코멘트가 달립니다.
- **동적 스캔(ZAP):** 대상 URL에 대해 OWASP ZAP가 동적 보안 진단을 수행하고, 결과를 CVSS 기준으로 점수화합니다.
- **AI 분석 라우팅:** `AiAnalyzer` 인터페이스 + `AiRouter` 로 GPT → Claude → Gemini → 자체 모델(CUSTOM) 순서의 폴백 구조를 구성해 가용성과 비용을 함께 잡았습니다.
- **자체 모델:** NVD CVE 기반 RAG + QLoRA 파인튜닝 LLM이 코드 스니펫을 입력받아 취약점·CVE·CWE·CVSS·수정 코드를 출력합니다.

### 1.4. 기존 서비스 대비 차별성
- 진단 결과를 **개발 워크플로(PR) 안에서** 코드 라인 단위로 제공 — 별도 도구 전환이 필요 없습니다.
- 영어 리포트가 아닌 **한국어 설명 + 수정 코드 스니펫**으로 즉시 조치 가능합니다.
- 상용 API에 종속되지 않는 **자체 파인튜닝 모델(QLoRA + RAG)** 을 폴백 체인의 한 축으로 보유해, 비용·프라이버시 측면에서 자생력이 있습니다.
- 벤치마크 결과 자체 어댑티브 시스템(QLoRA+RAG)이 **탐지율 95%, 평균 2.71s** 로 Grok-3 API(95%, 17.66s) 대비 약 6.5배 빠른 응답을 달성했습니다.

### 1.5. 사회적가치 도입 계획
- 보안 전문 인력이 부족한 **중소기업·스타트업·1인 개발자**가 추가 비용 없이 PR 단계에서 보안 점검을 받을 수 있게 합니다.
- 한국어 가이드 제공으로 국내 개발자의 **보안 학습·내재화**를 돕습니다.
- 안전한 코드 문화를 확산해 개인정보 유출·서비스 침해 등 사회적 피해를 예방합니다.

---

## 2. 상세설계

### 2.1. 시스템 구성도
```
GitHub PR / 사용자 ──► scanops-frontend (대시보드 · Vercel)
                              │
                              ▼
                     scanops-backend (Spring Boot · Railway)
                     - Webhook 수신 / 스캔 오케스트레이션
                     - AiRouter (GPT→Claude→Gemini→CUSTOM)
                       │                    │
        ┌──────────────┘                    └──────────────┐
        ▼                                                   ▼
scanops-infra (OWASP ZAP · AWS EC2)              scanops-model (QLoRA+RAG · Ollama)
- 동적 스캔                                        - 코드 정적 취약점 분석
- DVWA 테스트 타깃                                 - NVD CVE 기반 Qdrant RAG
        │                                                   │
        └────────────────► PostgreSQL (Railway) ◄───────────┘
```

### 2.2. 사용 기술
| 스택 | 기술 / 버전 | 배포 |
|------|-------------|------|
| Frontend | React 18, TypeScript 5, Vite 6, Tailwind CSS v4, React Router v6, Recharts, FSD 아키텍처 | Vercel |
| Backend | Spring Boot 3.2.5, Java 17, Spring Data JPA, WebClient/WebFlux, Gradle | Railway |
| Security Engine | OWASP ZAP (`ghcr.io/zaproxy/zaproxy:stable`) | AWS EC2 |
| AI Model | QLoRA 파인튜닝 (Qwen2.5-Coder-1.5B / Gemma-2 2B), RAG (BAAI/bge-small-en-v1.5 + Qdrant), Ollama 서빙 | Railway |
| Database | PostgreSQL 15 | Railway |
| Infra | Docker Compose (로컬: ZAP + DVWA + PostgreSQL) | - |

**활용한 생성형 AI / AI 코딩 도구**
- **Claude Code (Anthropic)** — 멀티 레포 아키텍처 정리, 백엔드·모델 코드 작성, 벤치마크·리팩토링, GitHub Actions 미러링 자동화에 활용.
- **OpenAI GPT / Anthropic Claude / Google Gemini API** — 런타임 AI 분석 폴백 체인(`AiRouter`)의 구성 요소.
- **자체 파인튜닝 LLM** — QLoRA(Qwen2.5-Coder / Gemma-2) + NVD CVE RAG로 보안 특화 분석 모델 구축.

---

## 3. 개발결과

### 3.1. 전체시스템 흐름도
```
1) 개발자가 PR 생성 (또는 대시보드에서 URL 스캔 요청)
2) GitHub Webhook → scanops-backend 수신
3) 백엔드가 변경 코드/대상 수집 → ZAP 동적 스캔 + AI 정적 분석 요청
4) AiRouter가 가용 모델로 분석 (GPT→Claude→Gemini→자체 모델 폴백)
5) 취약점에 CVE·CWE·CVSS·수정 가이드 매핑
6) 결과 저장(PostgreSQL) → PR 인라인 코멘트 + 대시보드 + PDF 리포트
```

### 3.2. 기능설명
- **GitHub App PR 분석:** 레포에 [GitHub App](https://github.com/apps/scanops-security-scanner)을 설치하고 PR을 올리면 자동으로 보안 분석이 시작됩니다. 취약점이 발견되면 해당 코드 라인에 한국어로 원인과 수정 방법이 코멘트로 달립니다.
- **스캔 요청 페이지:** 대상 URL을 입력해 동적 보안 스캔을 시작합니다.
- **스캔 상태 페이지:** 진행 중인 스캔 상태를 폴링하여 실시간으로 보여줍니다.
- **리포트 페이지:** 단일 스캔의 취약점 목록·심각도(CVSS)·분포 차트(Recharts)를 상세히 제공하고, PDF 리포트로 내려받을 수 있습니다.

> 📹 시연 영상: `섹션 5` 참고

### 3.3. 기능명세서
> 기능명세서 링크(노션/PDF/스프레드시트)를 여기에 추가하세요. — https://lavish-carpet-8f6.notion.site/ScanOps-3730070cb76480ebacf6dc6ee917f99d?pvs=74

### 3.4. 디렉토리 구조
본 제출 레포지토리는 4개 서비스 레포를 동일 이름의 서브폴더로 미러링한 모노 구조입니다. 각 레포는 `main` 브랜치 push 시 GitHub Actions로 자동 동기화됩니다.

```
pnuai-c-03-scanops/
├── scanops-frontend/   React + TS + Vite + Tailwind, FSD 아키텍처 (대시보드 UI)
├── scanops-backend/    Spring Boot 3.2.5 (Webhook 수신·분석 오케스트레이션·AiRouter)
├── scanops-model/      QLoRA + RAG 보안 분석 LLM (Python, scanops CLI)
├── scanops-infra/      Docker Compose (ZAP + DVWA + PostgreSQL)
└── README.md
```

| 서비스 | 설명 | 원본 레포 |
|--------|------|-----------|
| `scanops-frontend` | 대시보드 UI | [26Graduation/scanops-frontend](https://github.com/26Graduation/scanops-frontend) |
| `scanops-backend` | Spring Boot 백엔드 | [26Graduation/scanops-backend](https://github.com/26Graduation/scanops-backend) |
| `scanops-model` | AI 모델 서버 (QLoRA + RAG) | [26Graduation/scanops-model](https://github.com/26Graduation/scanops-model) |
| `scanops-infra` | ZAP + 인프라 구성 | [26Graduation/scanops-infra](https://github.com/26Graduation/scanops-infra) |

### 3.5. AI 도구 활용
- **설계 단계:** Claude Code로 멀티 레포 아키텍처(레포 분리, 의존성 정리, 해커톤 미러링 워크플로)를 설계·정리했습니다.
- **개발 단계:** 백엔드 `AiRouter` 폴백 구조, 모델 RAG 파이프라인, 프론트엔드 FSD 구조 코드를 AI 페어 프로그래밍으로 작성했습니다.
- **모델 단계:** QLoRA 파인튜닝 데이터 구성·벤치마크 자동화에 AI를 활용해, 어댑티브(QLoRA+RAG) 시스템에서 **탐지율 95% / 평균 2.71s** 성과를 도출했습니다.
- **성과:** AI 도구로 4개 레포의 일관된 구조와 자동 동기화 파이프라인을 단기간에 구축하고, 자체 모델 성능을 상용 API 수준까지 끌어올렸습니다.

---

## 4. 설치 및 사용 방법

### 가장 쉬운 방법 — GitHub App 설치
1. [ScanOps GitHub App](https://github.com/apps/scanops-security-scanner) 페이지에서 **Install** 클릭
2. 분석할 레포 선택
3. PR을 올리면 자동으로 보안 분석 시작 → 코드 라인에 코멘트로 결과 표시

### 로컬 실행 (개발용)
각 서비스 레포의 `README.md`에 상세 가이드가 있습니다.

```bash
# 1) 인프라 (ZAP + DVWA + PostgreSQL)
cd scanops-infra && docker-compose up -d

# 2) 모델 서버 (QLoRA + RAG)
cd scanops-model && pip install -e .
docker-compose up -d          # Qdrant
scanops scan <파일/디렉토리>   # CLI 분석

# 3) 백엔드 (Spring Boot)
cd scanops-backend && ./gradlew bootRun

# 4) 프론트엔드 (React)
cd scanops-frontend && npm install && npm run dev
```

---

## 5. 소개 및 시연 영상
> 프로젝트 소개 영상을 교육원 메일(swedu@pusan.ac.kr)로 제출 후 부여받은 YouTube URL을 여기에 추가하세요. — 

---

## 6. 팀 소개
> 창업트랙(C) 3조 · 팀 **ScanOps**

| 이름 | 역할 | 연락처 |
|------|------|--------|
| 김세한 | 팀장 | 010-7722-3694 |
| 전혜은 | 개발 | 010-9155-8528 |
| 이경윤 | 개발 | 010-2012-9376 |
| 최효석 | UX/마케팅 | 010-8974-3098 |

---

## 7. 해커톤 참여 후기
> 팀원별 참여 후기를 작성하세요. — 
