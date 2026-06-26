# ScanOps — Railway → AWS 마이그레이션 가이드

> **핵심 요약: 코드 수정은 거의 없다. 전부 "환경변수 + 배포 설정"이다.**
> ZAP 연동, 모델 호출 등은 이미 환경변수로 추상화돼 있어서 Java/Python 코드는 안 건드려도 된다.
> 바로 실행하려면 → [`docker-compose.aws.yml`](./docker-compose.aws.yml) + [`.env.aws.example`](./.env.aws.example)

---

## 1. 시스템 구성 (서비스 7개)

| 서비스 | 기술 | 포트 | 역할 | 외부 노출 |
|---|---|---|---|---|
| frontend | React (Vercel 유지 가능) | - | UI | ✅ |
| **backend** | Spring Boot · Java 17 | 8080 | 인증·API·스캔 오케스트레이션 | ✅ (이것만) |
| model-server | FastAPI · Python 3.11 | 8100 | AI 분석·RAG·코드그래프 | ❌ 내부 |
| ollama | Ollama | 11434 | LLM(GGUF) 구동 | ❌ 내부 |
| qdrant | Qdrant | 6333 | 벡터 DB(CVE) | ❌ 내부 |
| postgres | PostgreSQL | 5432 | 백엔드 DB | ❌ 내부 |
| zap | OWASP ZAP | 8090 | DAST 스캐너 | ❌ **절대 외부 금지** |

**흐름:** `프론트 → backend(8080) → model-server(8100) → ollama(11434)+qdrant(6333)`,
그리고 `backend → zap(8090)`, `backend → postgres`.

---

## 2. 코드 수정 — 사실상 없음 ✅

전부 환경변수로 되어 있어 **값만 바꾸면 된다:**
- `ZAP_HOST` → `http://zap:8090` (compose 내부 서비스명)
- `SCANOPS_MODEL_URL` → `http://model-server:8100`
- DB 접속값 → RDS 쓰면 RDS 엔드포인트

`ZapClient.java`(`@Value("${zap.host}")`), `ScanopsModelClient.java`(`@Value("${scanops.model.url}")`)
모두 env 주입이라 손댈 필요 없음.

---

## 3. 환경변수 전체

→ [`.env.aws.example`](./.env.aws.example) 복사해서 `.env.aws`로 채우면 됨. 핵심만:

**backend**
```
JDBC_DATABASE_URL, PGUSER, PGPASSWORD      # DB (RDS면 RDS값)
SCANOPS_MODEL_URL=http://model-server:8100
SCANOPS_API_KEY                            # 모델서버와 공유 시크릿
ZAP_HOST=http://zap:8090, ZAP_API_KEY
OPENAI/CLAUDE/GEMINI_API_KEY               # AI 폴백(선택)
GITHUB_APP_ID/PRIVATE_KEY/WEBHOOK_SECRET   # PR 스캔
CORS_ALLOWED_ORIGINS                       # 프론트 도메인
```
**model-server**
```
QDRANT_URL=http://qdrant:6333, QDRANT_COLLECTION=cve_vulnerabilities
OLLAMA_URL=http://ollama:11434/api/generate
OLLAMA_MODEL=qwen2.5-coder-security-v11    # ★ v4 → v11(3B) 교체 예정
SCANOPS_API_KEY                            # backend와 동일
XAI_API_KEY                                # Grok 번역/폴백(선택)
```

---

## 4. 사용 모델

- 현재 production: `qwen2.5-coder-security-v4` (1.5B, ~1GB)
- **교체 예정: `qwen2.5-coder-security-v11` (3B, ~2GB)** — 탐지력·CWE 식별 대폭 향상.
  세한이가 GGUF 변환·Ollama 등록 후 `OLLAMA_MODEL` 값만 바꾸면 됨.
- GPU **불필요** (양자화 모델 CPU 구동).

---

## 5. AWS EC2 인스턴스

**MVP(전부 한 대): `t3.xlarge` (4 vCPU, 16GB) — 온디맨드 ~$120/월, 1년 예약 ~$75/월**

| 서비스 | 메모리 |
|---|---|
| Ollama + 3B 모델 | ~3GB |
| ZAP (스캔 중) | ~2GB |
| Spring backend | ~1GB |
| Qdrant | ~0.5GB |
| Postgres(컨테이너) | ~0.5GB |
| 여유 | ~9GB |

- t3.large(8GB)는 ZAP 스캔+모델 동시면 **빠듯** → t3.xlarge 권장.
- OS: **Ubuntu 22.04**, 디스크 **30GB+**, 리전 **ap-northeast-2(서울)**.

---

## 6. Ollama 모델 등록 (최초 1회)

기존 dev compose엔 Ollama가 없었음(로컬 brew). AWS는 컨테이너로 추가됨(`docker-compose.aws.yml`).
GGUF 파일(`qwen-security-v11.Q4_K_M.gguf`)과 `Modelfile`을 `scanops-infra/models/`에 두고:
```bash
docker compose -f docker-compose.aws.yml exec ollama \
  ollama create qwen2.5-coder-security-v11 -f /models/Modelfile_v11
```
(Modelfile은 scanops-model 레포 `models/Modelfile_v11` 참고)

---

## 7. ⚠️ ZAP — 비용·보안 최대 주의

- **메모리/CPU 폭식**: 능동 스캔 1건 1~2GB + CPU 100%, 수분~수십분. 모델이랑 같은 박스면 스캔 중 API 느려짐.
- **MVP**: 같은 EC2에 두되 **동시 스캔 제한**(플랜별 DAST 횟수 제한이 안전장치).
- **확장**: ZAP을 **ECS Fargate on-demand**로 빼서 스캔 시에만 띄우고 종료 → 비용 절감.
- **🔒 보안 필수**: ZAP API(8090)는 API 키 1개뿐 → **외부 절대 노출 금지**. compose에 `ports` 매핑 안 함(내부 전용).

---

## 8. 네트워크 / 보안그룹

```
[인바운드]
22 (SSH)         : 본인 IP만
80/443 (HTTP/S)  : 0.0.0.0/0 → ALB/nginx → backend(8080)
8080·8090·8100·11434·6333·5432 : 외부 차단 (내부 통신만)

[아웃바운드]
443 : NVD/GitHub/외부 LLM API
ZAP : 고객 도메인 스캔용 (소유권 인증 통과 도메인만)
```

---

## 9. 배포 순서

1. EC2 t3.xlarge(Ubuntu 22.04, 30GB) 생성 + Docker/Compose 설치
2. 세 레포 같은 부모 폴더에 clone (`scanops-infra`, `scanops-backend`, `scanops-model`)
3. `scanops-infra/.env.aws` 작성
4. `docker compose -f docker-compose.aws.yml --env-file .env.aws up -d --build`
5. Ollama 모델 등록(§6), Qdrant에 CVE 적재(`python -m scanops.data.prepare`)
6. 보안그룹: 80/443만 열기
7. 도메인 + ALB(또는 nginx) + HTTPS(ACM 인증서)
8. 프론트 `VITE_API_URL` → AWS backend 주소로 변경 (코드 수정 없음)
9. (안정화 후) Postgres → **RDS** 분리, ZAP → on-demand 분리

---

## 10. 자주 헷갈리는 점

- **dev용 `docker-compose.yml`**(dvwa 포함, 로컬 테스트용)은 그대로 두고, **운영은 `docker-compose.aws.yml`** 사용.
- **Neo4j**는 현재 안 씀(코드가 인메모리 그래프로 폴백). 나중에 그래프 시각화 붙일 때 Aura 연동 + `NEO4J_URI` 추가.
- backend와 model-server의 **`SCANOPS_API_KEY`는 반드시 동일** (PR 스캔 인증).
