# ScanOps — 보안 특화 AI 취약점 진단 SaaS
> 부산대학교 2026 AI 해커톤 · 창업트랙(C) 3조 · 팀 **ScanOps**
![데모 화면](https://github.com/PNU-2026-AI-Hackathon/pnuai-c-03-scanops/thumbnail)
[![GitHub App](https://img.shields.io/badge/GitHub%20App-설치하기-238636?logo=github)](https://github.com/apps/scanops-security-scanner)

웹 URL 또는 GitHub 코드를 입력하면, **자체 파인튜닝한 보안 특화 LLM(Qwen3.5-9B)과 Joern 코드그래프(CPG) 하이브리드 엔진**이 보안 취약점을 자동으로 찾아 CVE·CWE·CVSS 근거와 한국어 수정 가이드를 제공하는 **개발자 친화 보안 진단 SaaS**입니다. 미학습 신규 CVE 1,197건 교차검증 기준 **AUC 0.91, 정밀도 81.3%**를 달성했으며, 이는 상용 최상위 모델인 Claude Sonnet 5(정밀도 47.1%) 대비 오탐률을 5분의 1 수준(15.7% vs 79.5%)으로 낮춘 결과입니다.

> **소스코드는 메모리에서만 처리 후 즉시 폐기하고, 결과만 보관(사용자 삭제 전까지·최대 1개월)합니다.** — 코드 프라이버시가 우리의 핵심 약속입니다.

---

## 1. 프로젝트 소개

### 1.1. 개발배경 및 필요성
- 보안 점검은 보통 개발이 끝난 뒤 별도 단계에서 이루어져 발견이 늦고 수정 비용이 큽니다. 실제로 2025년 SK텔레콤은 2,300만 명 개인정보 유출로 역대 최대인 1,348억 원의 과징금을 받았고, 저희가 직접 참가한 '모두의 창업' 플랫폼에서도 API 권한 검증 미흡으로 1차 통과자 개인정보가 유출되는 사고가 있었습니다. 둘 다 사전 점검 한 번이면 막을 수 있었던 사고입니다.
- 기존 상용 SAST 도구(예: 스패로우)는 가격이 높고 정적 분석(SAST)에 치우쳐 있으며, 연 단위 견적·영업 미팅을 거쳐야 시작할 수 있어 소규모 팀의 진입장벽이 높습니다. 결과도 영어·전문 용어 위주라 비(非)보안 개발자가 곧바로 조치하기 어렵습니다.
- 범용 AI 코딩 에이전트·챗봇(Claude, ChatGPT 등)은 보안에 특화되어 있지 않아 취약점 탐지의 일관성이 떨어지고, 코드가 외부 서버로 그대로 전송된다는 근본적인 우려가 있습니다. 저희 자체 설문(스타트업 개발자 70명)에서도 77%가 보안 점검을 안 하거나 하려다 말았고, 가장 큰 이유는 "방법을 몰라서"(62%)였습니다.
- "코드를 작성하는 흐름 안에서" 취약점을 짚어주고 **무엇이·왜 문제이며·어떻게 고치는지**까지, 그리고 **고객 코드를 외부에 남기지 않으면서** 알려주는 도구가 필요했습니다.

### 1.2. 개발 목표 및 주요 내용
- 상용 API에 종속되지 않는 **보안 특화 자체 파인튜닝 모델(Qwen3.5-9B + QLoRA)** 과 **Joern 코드그래프(CPG) 하이브리드 엔진**으로 취약점을 진단한다.
- **DAST(웹 URL) / SAST(레포 전체) / GitHub Actions(PR diff)** 세 가지 스캔 방식을 한 플랫폼에서 제공한다.
- 익명 구조에서 **사용자 계정 · 구독 · 사용량 게이트** 기반 SaaS로 전환한다 (모든 스캔이 `user_id`에 귀속).
- **코드 즉시 삭제 정책 + 삭제 증빙 로그**로 프라이버시를 데이터로 증명한다.
- 판정은 **LLM이 1차로 내리고, 코드그래프는 탐지를 "추가"만 한다**(그래프의 안전 판정이 LLM의 취약 판정을 덮지 않음)는 정책으로, 실측 기반 오탐 억제와 탐지 커버리지를 동시에 관리한다.

### 1.3. 세부내용

**세 가지 스캔 방식**

| 방식 | 입력 | 검사 범위 | 사용량 미터 |
|------|------|-----------|-------------|
| DAST | 웹 URL / 도메인 | 실행 중인 앱 외부 동적 분석 (OWASP ZAP) | 스캔 횟수 |
| SAST | Git 레포 URL | 레포 전체 코드 정적 분석 (LLM + Joern CPG) | 전체 LOC 누적 |
| GitHub Actions | PR 이벤트 | PR diff 파일 전체 (변경 라인엔 위치 댓글, 그 외엔 위치 없이 보고) | 분석 파일 LOC 누적 |

**구독 플랜**

| 플랜 | 가격 | DAST(웹 URL) | SAST(레포 LOC) & GitHub Actions(LOC) |
|------|------|------|------|
| Free | 0원 | 1회 | ✗ |
| Pro | 19,900원/월 | 월 5회 | 월 10만 줄 |
| Max | 69,000원/월 | 월 30회 | 월 40만 줄 |
| Team | 59,000원/월 (+2만 원/추가 인원) | 월 20회 | 월 33만 줄 |

> 가격은 자체 설문(70명)·심층 인터뷰 결과를 근거로 책정했습니다 — 개인은 월 2만 원 안팎, 팀은 월 7~10만 원까지 지불 의향이 있다고 응답했고, 혼합 기준 월 ARPU는 23,000원으로 설계했습니다.

- **AI 분석 엔진:** Qwen3.5-9B을 QLoRA로 파인튜닝한 보안 특화 LLM(GGUF Q4_K_M 양자화 5.3GB + LoRA 어댑터 56MB)이 1차 판정을 내리고, NVD CVE 8,883건 기반 Qdrant RAG가 CVE·CWE 근거를 첨부합니다.
- **하이브리드 탐지 엔진 (LLM + 코드그래프):** Joern(Apache 2.0) 기반 코드그래프(CPG) taint 분석과 자체 정규식 기반 code graph가 LLM 판정에 결과를 **추가만** 합니다. 최종 판정 = `LLM 취약 OR 그래프 취약` — 그래프가 "안전"으로 봐도 LLM의 취약 판정을 덮어쓰지 않는 정책입니다(그래프 단독 안전 판정의 오판률이 높다는 자체 실측에 근거).
- **AI 분석 라우팅:** `AiAnalyzer` 인터페이스 + `AiRouter`로 자체 모델(CUSTOM)을 축으로 GPT/Claude/Gemini 폴백 체인을 구성해 가용성·비용을 함께 잡았습니다.

### 1.4. 기존 서비스 대비 차별성
- **코드 프라이버시:** 소스코드는 메모리에서만 처리 후 즉시 폐기, 결과만 보관. 삭제 증빙 로그로 "즉시 폐기" 약속을 데이터로 증명합니다. (무료/Pro URL 스캔은 코드 미전송, GitHub Actions는 고객 인프라 내 스캔 후 결과만 전송하는 **구조적 분리**)
- **SAST + DAST 동시 제공:** 정적 분석에 치우친 기존 상용 도구와 달리 정적·동적 분석을 모두 제공합니다.
- **자체 무료 모델:** 상용 API에 종속되지 않는 파인튜닝 모델(Qwen3.5-9B, GGUF Q4_K_M 5.3GB + LoRA 어댑터 56MB)을 자체 인프라(AWS·RunPod)에서 무제한 구동해 비용·프라이버시 측면에서 자생력이 있습니다.
- **검증된 정확도:** 미학습 신규 CVE 1,197건 교차검증 기준 **AUC 0.91, 정밀도 81.3%, 오탐률 15.7%**를 기록했습니다. 이는 상용 최상위 모델 Claude Sonnet 5(정밀도 47.1%, 오탐률 79.5%) 대비 오탐을 5분의 1 수준으로 낮춘 결과이며, PrimeVul(오탐률 10.6%)·CleanVul 두 외부 벤치마크로 추가 교차 검증했습니다. (측정 조건: 50:50 균형 표본 기준 — 실제 운영 환경의 취약점 비율에 따라 수치는 달라질 수 있습니다.)
- **차별화 증명:** 범용 에이전트(Claude Code/Codex)·경쟁사(스패로우, SAST 계열) 대비 같은 입력으로 결과를 나란히 비교하는 벤치마크 데모를 제공합니다.

### 1.5. 사회적가치 도입 계획
- 보안 전문 인력이 부족한 **중소기업·스타트업·1인 개발자**가 저비용으로 PR/배포 단계에서 보안 점검을 받게 합니다.
- 한국어 가이드 제공으로 국내 개발자의 **보안 학습·내재화**를 돕습니다.
- 코드 미보관 원칙으로 진단 과정 자체의 **정보 유출 리스크를 제거**합니다.
- 안전한 코드 문화를 확산해 개인정보 유출·서비스 침해 등 사회적 피해를 예방합니다.

---

## 2. 상세설계

### 2.1. 시스템 구성도
```
사용자 (로그인 · 소유권 인증 · 사용량 게이트)
        │  웹 URL / GitHub 레포 / PR
        ▼
 scanops-frontend (대시보드 · Vercel)
        │
        ▼
 scanops-backend (Spring Boot · AWS)
 - 인증/구독/사용량 게이트 (AiRouter)
 - GitHub App Webhook · 스캔 오케스트레이션
        │  HTTPS POST /analyze(/batch)
        ▼
 분석 코어 (AWS · RunPod GPU)
 ├─ FastAPI (api_rebuild.py)
 ├─ LLM 서빙 (Qwen3.5-9B + QLoRA 어댑터, GGUF Q4_K_M · llama.cpp/Ollama)
 ├─ Joern CPG 워커 (taint 분석 · evidence 전용, 최종 판정에 "추가"만 관여)
 └─ Qdrant  (NVD CVE 8,883건 벡터 검색 · RAG 근거)
        │
        ▼
 OWASP ZAP (DAST 동적 스캔 · scanops-infra, 외부 노출 금지)
        │
        ▼
 PostgreSQL (스캔·결과·사용량·구독 / 코드 원문 미저장)
```

### 2.2. 사용 기술

| 스택 | 기술 / 버전 | 배포 |
|------|-------------|------|
| Frontend | React 18, TypeScript 5, Vite 6, Tailwind CSS v4, React Router v6, Recharts, FSD 아키텍처 | Vercel |
| Backend | Spring Boot 3.2.5, Java 17, Spring Data JPA, Spring Security(JWT/OAuth), WebClient | AWS |
| AI 분석 API | FastAPI (Python), llama.cpp/Ollama 서빙 | AWS / RunPod |
| AI Model | QLoRA 파인튜닝 (Qwen3.5-9B 베이스), GGUF Q4_K_M(5.3GB) + LoRA 어댑터(56MB) | HuggingFace Hub → AWS/RunPod |
| RAG | 임베딩 + Qdrant (NVD CVE 8,883건) | AWS |
| Security Engine | OWASP ZAP (`ghcr.io/zaproxy/zaproxy:stable`, DAST) + Joern CPG taint 분석(SAST, Apache 2.0, evidence 전용) | AWS / 로컬 |
| Database | PostgreSQL 15 | AWS |
| 결제 | 토스페이먼츠 / 스트라이프 (예정) | - |
| Infra | Docker Compose (로컬: ZAP + DVWA + PostgreSQL), 하이브리드 배포(분석 코어 AWS·RunPod / BE·FE AWS·Vercel) | - |

**활용한 생성형 AI / AI 코딩 도구**
- **Claude Code (Anthropic)** — 멀티 레포 아키텍처 정리, 백엔드·모델 코드 작성, 벤치마크·리팩토링, GitHub Actions 미러링 자동화에 활용.
- **자체 파인튜닝 LLM (핵심)** — Qwen3.5-9B를 QLoRA로 보안 특화 파인튜닝(함수 샘플 14,895건 학습 / CWE 35종 / 이 중 71%가 CVEfixes 코퍼스 10,404건) + NVD CVE RAG + Joern CPG 하이브리드 결합.
- **Anthropic Claude** — 자체 모델 성능을 검증하는 비교군.

---

## 3. 개발결과

### 3.1. 전체시스템 흐름도
```
진입(회원 분기)
  ├─ 미회원 → 회원가입(이메일/GitHub OAuth) → 이메일 인증 → 로그인
  └─ 회원   → 로그인
        │
        ▼
   랜딩 (차별점 · 가격 · 약관/개인정보)
     ├─ 구독/결제
     └─ MyPage (개인정보 · 스캔기록+삭제 · 사용량 미터 · 구독상태)
            │
            ▼
   스캔  ① 로그인  ② 레포/도메인 소유권 인증  ③ 플랜별 사용량 한도 통과
            │
            ▼
   분석  FastAPI → LLM(Qwen3.5-9B QLoRA) 1차 판정
         → Joern CPG·자체 code graph가 탐지 추가(그래프의 safe 판정은 결과를 덮지 않음)
         → Qdrant RAG로 CVE·CWE 근거 보강
            │
            ▼
   결과  취약점 + CVE/CWE + CVSS + 신뢰도 → 대시보드 / PDF / AI 브리핑
        (소스코드는 폐기, 결과만 저장 · 삭제 증빙 로그 기록)
```

### 3.2. 기능설명
- **인증/계정:** 이메일·GitHub OAuth 가입/로그인, 이메일 인증, 약관 동의 기록, JWT 세션, 비밀번호 재설정.
- **MyPage:** 프로필·구독 등급, 이번 달 사용량 미터(DAST 횟수 / Actions·SAST LOC 잔여), 스캔 기록 조회·재조회(보관 1개월), 개별·전체 결과 삭제, 회원 탈퇴.
- **소유권 인증:** DAST 대상 도메인(DNS TXT)·SAST/Actions 대상 레포(repo 파일) 소유권을 검증한 뒤에만 스캔, 검증된 타겟은 재사용.
- **스캔 게이트:** 스캔 전 ① 로그인 ② 소유권 인증 ③ 플랜별 사용량 한도를 통과시킵니다.
- **결과 출력:** 취약점별 CVSS·신뢰도·위치 상세 뷰, CVSS 7.0 이상 우선 필터링, 공유용 PDF, Claude/GPT에 붙여 수정코드를 받는 AI 보안 브리핑(Pro+).
- **GitHub App PR 분석:** [GitHub App](https://github.com/apps/scanops-security-scanner) 설치 후 PR을 올리면 자동 분석, 취약점이 발견되면 해당 코드 라인에 한국어 코멘트가 달립니다.

> 📹 시연 영상: `섹션 5` 참고

### 3.3. 디렉토리 구조

```
pnuai-c-03-scanops/
├── scanops-frontend/   React + TS + Vite + Tailwind, FSD 아키텍처 (대시보드 UI)
├── scanops-backend/    Spring Boot 3.2.5 (인증·구독·게이트·스캔 오케스트레이션·AiRouter)
├── scanops-model/      Qwen3.5-9B QLoRA + Joern CPG 하이브리드 보안 분석 엔진 (FastAPI · llama.cpp/Ollama · Qdrant)
├── scanops-infra/      Docker Compose (ZAP + DVWA + PostgreSQL)
└── README.md
```

| 서비스 | 설명 |
|--------|------|
| `scanops-frontend` | 대시보드 UI |
| `scanops-backend` | Spring Boot 백엔드 (인증·구독·게이트) |
| `scanops-model` | AI 분석 서버 (Qwen3.5-9B QLoRA + Joern CPG 하이브리드, FastAPI) |
| `scanops-infra` | ZAP + 인프라 구성 |

### 3.4. AI 도구 활용 및 모델 성능

**AI 도구 활용**
- **설계:** Claude Code로 멀티 레포 아키텍처(레포 분리, 의존성 정리, 해커톤 미러링 워크플로, SaaS 전환 설계)를 정리했습니다.
- **개발:** 백엔드 `AiRouter` 폴백 구조, 모델 RAG·Joern 하이브리드 파이프라인, 프론트엔드 FSD 구조 코드를 AI 페어 프로그래밍으로 작성했습니다.
- **모델:** QLoRA 파인튜닝 데이터 생성·학습·GGUF 양자화·벤치마크 자동화 전 과정을 AI로 가속했습니다. 모든 성능 수치는 측정 전 기준을 사전에 문서로 등록한 뒤, 결과를 본 후 바꾸지 않는 방식으로 관리합니다.

**모델 (Qwen3.5-9B + QLoRA)**
- 베이스: Qwen3.5-9B (양자화 후 GGUF Q4_K_M 5.3GB) + LoRA 어댑터(56MB)
- 파인튜닝: QLoRA로 학습 가능 파라미터만 업데이트, 함수 샘플 **14,895건** 학습(CWE 35종, 이 중 71%인 10,404건이 CVEfixes 코퍼스)
- RAG: NVD CVE **8,883건**을 Qdrant에 벡터 색인해 판정 근거로 첨부(판정 자체에는 관여하지 않음)
- 하이브리드 결합: Joern CPG taint 분석 + 자체 code graph가 LLM 판정에 탐지를 **추가만** 함 (`최종 = LLM 취약 OR 그래프 취약`)

**벤치마크 (교차 검증)**

| 벤치마크 | 표본 | 지표 | ScanOps | Claude Sonnet 5 |
|---|---|---|---|---|
| 내부 test (CVEfixes 시간분할 홀드아웃, 미학습) | 1,197건 | AUC | **0.91** | — |
| 내부 test | 1,197건 | 정밀도 | **81.3%** | 47.1% |
| 내부 test | 1,197건 | 오탐률(FPR) | **15.7%** | 79.5% |
| PrimeVul (외부 독립 벤치마크) | 360건 | 오탐률(FPR) | **10.6%** | — |
| CleanVul (외부 독립 벤치마크) | — | 교차검증 | 진행 중 | — |

> 위 수치는 50:50 균형 표본을 기준으로 측정했습니다. 실제 운영 환경에서는 취약점 비율(유병률)에 따라 정밀도가 달라질 수 있어, 9월 클로즈드 베타에서 실측 기반으로 재검증할 예정입니다.

---

## 4. 설치 및 사용 방법

### 가장 쉬운 방법 — 웹 / GitHub App
1. 웹에서 회원가입·로그인 후 대상 URL·레포를 등록하고 소유권 인증 → 스캔 실행, 또는
2. [ScanOps GitHub App](https://github.com/apps/scanops-security-scanner) 설치 → 레포 선택 → PR 올리면 자동 분석.

### 로컬 실행 (개발용)
각 서비스 레포의 `README.md`에 상세 가이드가 있습니다.

```bash
# 1) 인프라 (ZAP + DVWA + PostgreSQL)
cd scanops-infra && docker-compose up -d

# 2) 모델/분석 서버 (FastAPI + llama.cpp/Ollama + Qdrant)
cd scanops-model && pip install -e .
docker-compose up -d            # Qdrant
scanops scan <파일/디렉토리>     # CLI 분석

# 3) 백엔드 (Spring Boot)
cd scanops-backend && ./gradlew bootRun

# 4) 프론트엔드 (React)
cd scanops-frontend && npm install && npm run dev
```

---

## 5. 소개 및 시연 영상
> [ScanOps 시연 영상](https://www.youtube.com/watch?v=Z4q63ReGvG8&list=PLCM3TKSFVwws&index=5) 

---

## 6. 팀 소개
> 창업트랙(C) 3조 · 팀 **ScanOps**

| 이름 | 역할 |
|------|------|
| 김세한 | 팀장 · AI 모델 · 프론트엔드 |
| 전혜은 | 백엔드 · 인프라 |
| 이경윤 | AI 모델 · 보안(코드그래프) |
| 최효석 | 기술영업 · 마케팅 · UI/UX/QA |

---

## 7. 해커톤 참여 후기
#### 김세한
창의융합 해커톤을 창업트랙으로 참여하면서 교수님들과 교육원분들의 피드백을 반영하여 좀 더 고도화 할 수 있는 기회가 되었습니다. 팀원들과 오랜 기간 프로젝트를 하면서 저희 주제의 빈약한 부분도 많이 발견하면서 기획부터 꼼꼼해야한다는 점을 느낄 수 있었습니다.
#### 전혜은
백엔드 개발자로서 실서비스를 Railway에서만 자동배포하는 경험만 있었는데, AWS로 마이그레이션 하면서 인프라에 대한 지식과 경험을 쌓는 좋은 프로젝트였습니다. 
#### 이경윤
연구로만 진행되던 보안 이론을 실제 서비스에 적용하고, 사용자들의 반응을 보면서 이론만으로 배울 수 없는 경험이었습니다.
#### 최효석
의학과라는 좁은 도메인을 벗어나 창업이라는 넓은 세상으로 발을 넓힐 수 있는 좋은 기회가 되었습니다. 이러한 경험을 바탕으로 의학 관련하여 창업 기회를 찾아보고싶습니다.
