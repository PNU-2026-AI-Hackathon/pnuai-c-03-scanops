export interface VulnMeta {
  cause: string
  remedy: string
  reference?: string
}

const meta: Record<string, VulnMeta> = {
  'Cross-Domain Misconfiguration': {
    cause:
      '서버가 `Access-Control-Allow-Origin: *` 와 같이 과도하게 허용적인 CORS 헤더를 반환하고 있습니다. 이로 인해 공격자가 임의의 외부 도메인에서 이 리소스를 요청해 민감한 데이터를 탈취할 수 있습니다.',
    remedy:
      '`Access-Control-Allow-Origin` 헤더를 와일드카드(`*`) 대신 신뢰할 수 있는 출처 목록으로 제한하세요.\n예) `Access-Control-Allow-Origin: https://yourdomain.com`\n자격 증명(쿠키 등)이 필요한 경우 `Access-Control-Allow-Credentials: true` 와 함께 특정 도메인만 허용해야 합니다.',
    reference: 'https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny',
  },
  'Content Security Policy (CSP) Header Not Set': {
    cause:
      'HTTP 응답 헤더에 `Content-Security-Policy`가 없습니다. CSP가 없으면 브라우저가 인라인 스크립트나 외부 출처의 스크립트를 제한 없이 실행해 XSS(Cross-Site Scripting) 공격에 취약해집니다.',
    remedy:
      '응답 헤더에 CSP를 추가하세요.\n예) `Content-Security-Policy: default-src \'self\'; script-src \'self\'; object-src \'none\'`\n다음 순서로 적용을 권장합니다:\n1. `Content-Security-Policy-Report-Only` 로 먼저 테스트\n2. 위반 리포트 확인 후 정책 정제\n3. 실제 `Content-Security-Policy` 헤더로 전환',
    reference: 'https://developer.mozilla.org/ko/docs/Web/HTTP/CSP',
  },
  'X-Frame-Options Header Not Set': {
    cause:
      '`X-Frame-Options` 헤더가 없어 이 페이지를 `<iframe>` 안에 삽입할 수 있습니다. 공격자가 투명한 iframe 위에 클릭을 유도해 사용자 모르게 원치 않는 작업을 실행시키는 클릭재킹(Clickjacking) 공격에 노출됩니다.',
    remedy:
      '모든 응답에 아래 헤더 중 하나를 추가하세요.\n- `X-Frame-Options: DENY` (모든 프레임 허용 안 함)\n- `X-Frame-Options: SAMEORIGIN` (동일 출처만 허용)\n또는 CSP의 `frame-ancestors` 지시어를 사용하세요: `Content-Security-Policy: frame-ancestors \'self\'`',
  },
  'Missing Anti-clickjacking Header': {
    cause:
      'X-Frame-Options 또는 Content-Security-Policy의 frame-ancestors 지시어가 없어 클릭재킹 공격에 취약합니다.',
    remedy:
      '`X-Frame-Options: SAMEORIGIN` 또는 `Content-Security-Policy: frame-ancestors \'self\'` 헤더를 추가하세요.',
  },
  'X-Content-Type-Options Header Missing': {
    cause:
      '`X-Content-Type-Options: nosniff` 헤더가 없어 브라우저가 응답의 MIME 타입을 잘못 추측(MIME sniffing)할 수 있습니다. 이를 이용해 공격자는 이미지나 텍스트 파일로 위장한 악성 스크립트를 실행시킬 수 있습니다.',
    remedy:
      '모든 응답에 `X-Content-Type-Options: nosniff` 헤더를 추가하고, 각 리소스가 올바른 `Content-Type`을 반환하는지 확인하세요.',
  },
  'Information Disclosure - Suspicious Comments': {
    cause:
      '소스코드나 응답에 내부 정보(TODO, FIXME, 비밀번호 힌트, 내부 시스템 정보 등)가 포함된 주석이 노출되어 있습니다. 공격자가 이를 통해 시스템 구조나 취약점을 파악할 수 있습니다.',
    remedy:
      '프로덕션 빌드 시 민감한 주석을 자동으로 제거하도록 빌드 도구를 설정하세요. 코드 리뷰에서 민감 정보가 포함된 주석을 차단하는 정책을 도입하고, 시크릿 키나 내부 경로는 절대 주석에 기록하지 마세요.',
  },
  'Strict-Transport-Security Header Not Set': {
    cause:
      'HSTS(HTTP Strict Transport Security) 헤더가 없어 브라우저가 HTTP로 초기 연결을 시도할 수 있습니다. 이를 공격자가 가로채 SSL 스트리핑 공격으로 HTTPS 연결을 HTTP로 다운그레이드할 수 있습니다.',
    remedy:
      '`Strict-Transport-Security: max-age=31536000; includeSubDomains` 헤더를 추가하세요. HTTPS가 완전히 구성된 후 적용하고, HSTS Preload List 등록도 고려하세요.',
  },
  'Server Leaks Version Information via "Server" HTTP Response Header Field': {
    cause:
      '`Server` 응답 헤더가 서버 소프트웨어와 버전 정보를 노출하고 있습니다. 공격자가 이 정보를 이용해 알려진 취약점을 대상으로 표적 공격을 할 수 있습니다.',
    remedy:
      '웹 서버 설정에서 `Server` 헤더를 제거하거나 값을 최소화하세요.\n- Nginx: `server_tokens off;`\n- Apache: `ServerTokens Prod` + `ServerSignature Off`\n- Express: `app.disable(\'x-powered-by\')`',
  },
  'Cookie Without Secure Flag': {
    cause:
      '쿠키에 `Secure` 플래그가 없어 HTTP 연결에서도 전송될 수 있습니다. 네트워크를 도청하는 공격자(중간자 공격)가 쿠키를 가로채 세션을 탈취할 수 있습니다.',
    remedy:
      '세션 쿠키 및 인증 관련 쿠키 모두에 `Secure` 플래그를 추가하세요. HTTPS만 사용하는 서비스라면 `HttpOnly; Secure; SameSite=Strict` 조합을 권장합니다.',
  },
  'Cookie No HttpOnly Flag': {
    cause:
      '쿠키에 `HttpOnly` 플래그가 없어 JavaScript(`document.cookie`)로 쿠키를 읽을 수 있습니다. XSS 취약점과 결합되면 공격자가 세션 쿠키를 탈취해 계정을 탈취할 수 있습니다.',
    remedy:
      '세션·인증 관련 모든 쿠키에 `HttpOnly` 플래그를 추가하세요. 클라이언트 JS에서 쿠키를 직접 읽을 필요가 없다면 반드시 설정해야 합니다.',
  },
  'Vulnerable JS Library': {
    cause:
      '알려진 보안 취약점이 있는 버전의 JavaScript 라이브러리를 사용 중입니다. 공격자가 공개된 익스플로잇을 이용해 XSS, 프로토타입 오염 등의 공격을 수행할 수 있습니다.',
    remedy:
      '라이브러리를 최신 보안 패치 버전으로 업데이트하세요. `npm audit` 또는 Snyk, Dependabot 등의 도구로 정기적으로 의존성 취약점을 점검하세요.',
  },
  'HTTPS Content Available via HTTP': {
    cause:
      'HTTPS로 제공되는 사이트의 콘텐츠가 HTTP로도 접근 가능합니다. HTTP는 암호화되지 않아 중간자(MITM) 공격자가 전송 중인 데이터를 도청하거나 변조할 수 있습니다. 또한 HSTS가 설정되지 않은 경우 SSL 스트리핑 공격으로 HTTPS 연결을 강제로 HTTP로 다운그레이드할 수 있습니다.',
    remedy:
      '모든 HTTP 요청을 HTTPS로 리다이렉트하도록 서버를 설정하세요.\n- Nginx: `return 301 https://$host$request_uri;`\n- Apache: `RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`\n\n추가로 `Strict-Transport-Security: max-age=31536000; includeSubDomains` 헤더를 설정해 브라우저가 이후 요청을 항상 HTTPS로 전송하도록 강제하세요.',
    reference: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/02-Testing_for_Padding_Oracle',
  },

  // ── 자주 발생하는 ZAP 탐지 항목 ───────────────────────────────────────────

  'Absence of Anti-CSRF Tokens': {
    cause:
      'HTML 폼에 CSRF 토큰이 없습니다. CSRF(Cross-Site Request Forgery) 공격은 피해자가 의도하지 않은 상태에서 공격자가 지정한 요청을 전송하도록 강제하는 방식입니다. 피해자가 해당 사이트에 로그인된 상태라면 공격자는 피해자 권한으로 임의의 작업을 실행할 수 있습니다.',
    remedy:
      '모든 상태 변경 폼에 서버에서 생성한 예측 불가능한 CSRF 토큰을 포함하세요.\n- Spring Security: `csrf()` 기본 활성화\n- Django: `{% csrf_token %}` 템플릿 태그 사용\n- 또는 `SameSite=Strict` 쿠키 속성으로 보완하세요.',
    reference: 'https://owasp.org/www-community/attacks/csrf',
  },
  'Sub Resource Integrity Attribute Missing': {
    cause:
      '외부 CDN에서 불러오는 스크립트·스타일시트에 `integrity` 속성이 없습니다. CDN이 해킹되거나 파일이 변조될 경우 악성 코드가 그대로 사용자 브라우저에서 실행될 수 있습니다.',
    remedy:
      '외부 리소스 태그에 `integrity`와 `crossorigin` 속성을 추가하세요.\n예) `<script src="..." integrity="sha384-xxxx" crossorigin="anonymous"></script>`\nhttps://www.srihash.org/ 에서 해시값을 자동으로 생성할 수 있습니다.',
    reference: 'https://developer.mozilla.org/ko/docs/Web/Security/Subresource_Integrity',
  },
  'Cookie without SameSite Attribute': {
    cause:
      '쿠키에 `SameSite` 속성이 없습니다. 이 경우 브라우저가 크로스 사이트 요청에도 쿠키를 함께 전송하여 CSRF 공격에 노출될 수 있습니다.',
    remedy:
      '쿠키 설정 시 `SameSite` 속성을 추가하세요.\n- `SameSite=Strict`: 크로스 사이트 요청에서 쿠키를 전혀 전송하지 않음 (가장 안전)\n- `SameSite=Lax`: 최상위 네비게이션 GET 요청에만 전송 (일반적인 권장값)\n- `SameSite=None; Secure`: 명시적으로 크로스 사이트 허용 시 사용',
  },
  'Cross-Domain JavaScript Source File Inclusion': {
    cause:
      '외부 도메인의 JavaScript 파일을 직접 불러오고 있습니다. 해당 외부 도메인이 해킹되거나 악의적인 경우, 변조된 스크립트가 사용자 브라우저에서 실행되어 세션 탈취·악성코드 주입이 발생할 수 있습니다.',
    remedy:
      '가능하면 외부 JS를 직접 호스팅하거나, SRI(`integrity`) 속성을 적용하세요.\n신뢰할 수 없는 출처의 스크립트는 제거하고, CSP의 `script-src` 지시어로 허용 도메인을 명시적으로 제한하세요.',
  },
  'Timestamp Disclosure - Unix': {
    cause:
      '응답 본문이나 헤더에 Unix 타임스탬프가 노출되어 있습니다. 공격자가 이를 통해 서버 내부 시간 정보, 파일 생성·수정 시각, 세션 만료 패턴 등을 추측하는 데 활용할 수 있습니다.',
    remedy:
      '응답에서 불필요한 타임스탬프 정보를 제거하거나 노출하지 않도록 코드를 수정하세요. 꼭 필요한 경우 사람이 읽기 어려운 형식으로 변환하거나 임의값을 추가해 패턴을 숨기세요.',
  },
  'External Redirect': {
    cause:
      '사용자 입력값(파라미터)을 검증 없이 리다이렉트 URL로 사용하고 있습니다. 공격자가 악의적인 URL로 파라미터를 조작하면 피싱 사이트로 사용자를 유도하거나, 인증 토큰 등 민감 정보를 탈취하는 오픈 리다이렉트 공격이 가능합니다.',
    remedy:
      '리다이렉트 URL을 화이트리스트로 관리하고, 외부 도메인으로의 리다이렉트는 차단하세요.\n예) 허용된 경로 목록만 사용하거나, 상대 경로만 허용하는 방식으로 구현하세요.',
    reference: 'https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html',
  },
  'CSP: script-src unsafe-inline': {
    cause:
      'Content-Security-Policy의 `script-src`에 `unsafe-inline`이 허용되어 있습니다. 이 설정은 인라인 `<script>` 태그와 이벤트 핸들러 속성(`onclick` 등)의 실행을 허용하므로 CSP가 XSS 방어 역할을 사실상 수행하지 못합니다.',
    remedy:
      '`unsafe-inline` 대신 nonce 또는 hash 기반 방식을 사용하세요.\n예) `Content-Security-Policy: script-src \'nonce-{랜덤값}\'`\n매 요청마다 새로운 nonce를 생성하고 허용된 스크립트 태그에만 적용하세요.',
  },
  'CSP: style-src unsafe-inline': {
    cause:
      'Content-Security-Policy의 `style-src`에 `unsafe-inline`이 허용되어 인라인 스타일 적용이 가능합니다. CSS 인젝션 공격을 통해 UI를 변조하거나 민감 정보를 추출하는 데 악용될 수 있습니다.',
    remedy:
      '`unsafe-inline` 대신 nonce 또는 hash 기반 방식으로 인라인 스타일을 제어하거나, 스타일을 외부 CSS 파일로 분리하세요.',
  },
  'Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)': {
    cause:
      '`X-Powered-By` 헤더가 사용 중인 프레임워크나 서버 기술 스택 정보를 노출합니다. 공격자가 특정 버전의 알려진 취약점을 겨냥한 공격에 활용할 수 있습니다.',
    remedy:
      '`X-Powered-By` 헤더를 응답에서 제거하세요.\n- Express: `app.disable(\'x-powered-by\')`\n- PHP: `php.ini`에서 `expose_php = Off`\n- Spring Boot: `server.server-header=` 빈값으로 설정',
  },
  'Re-examine Cache-control Directives': {
    cause:
      '응답의 `Cache-Control` 헤더 설정이 민감한 데이터를 브라우저·프록시 캐시에 저장하도록 허용할 수 있습니다. 공유 컴퓨터나 중간 프록시에서 인증 후 페이지가 캐시되어 다른 사용자에게 노출될 위험이 있습니다.',
    remedy:
      '인증이 필요하거나 민감한 정보가 포함된 응답에는 아래 헤더를 추가하세요.\n`Cache-Control: no-store, no-cache, must-revalidate`\n`Pragma: no-cache`',
  },
  'Session Management Response Identified': {
    cause:
      '응답에서 세션 관리와 관련된 쿠키나 토큰이 식별되었습니다. 세션 토큰이 안전하지 않은 방식으로 전송되거나 저장될 경우 세션 하이재킹 공격에 노출될 수 있습니다.',
    remedy:
      '세션 쿠키에 `HttpOnly`, `Secure`, `SameSite=Strict` 속성을 모두 적용하고, HTTPS 환경에서만 세션을 운용하세요. 로그아웃 시 서버 측에서 세션을 완전히 무효화하세요.',
  },
  'User Controllable HTML Element Attribute (Potential XSS)': {
    cause:
      '사용자 입력값이 HTML 요소의 속성에 충분한 이스케이핑 없이 삽입되고 있습니다. 공격자가 `"><script>` 같은 페이로드를 주입해 XSS(크로스 사이트 스크립팅) 공격을 수행할 수 있습니다.',
    remedy:
      '사용자 입력값을 HTML 속성에 출력할 때 반드시 이스케이핑 처리하세요.\n- HTML 속성에는 `"` → `&quot;`, `<` → `&lt;` 변환\n- 템플릿 엔진의 자동 이스케이핑 기능을 활성화하고, 직접 HTML을 조작하는 코드는 최소화하세요.',
    reference: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
  },
  'Authentication Request Identified': {
    cause:
      '인증 요청(로그인 폼 등)이 탐지되었습니다. 브루트포스 방어, 계정 잠금, 안전한 비밀번호 전송 여부를 점검이 필요합니다.',
    remedy:
      '로그인 엔드포인트에 다음을 적용하세요.\n- HTTPS를 통해서만 자격 증명 전송\n- 로그인 실패 횟수 제한 및 계정 잠금 정책\n- CAPTCHA 또는 MFA 적용\n- 비밀번호를 bcrypt 등 단방향 해시로 저장',
  },
  'Information Disclosure - Debug Error Messages': {
    cause:
      '서버가 상세한 디버그 에러 메시지(스택 트레이스, DB 쿼리, 파일 경로 등)를 응답에 노출하고 있습니다. 공격자가 이를 통해 내부 구조를 파악하고 더 정교한 공격을 준비할 수 있습니다.',
    remedy:
      '프로덕션 환경에서는 상세 에러 메시지 출력을 비활성화하고, 사용자에게는 일반적인 오류 페이지만 표시하세요.\n- Spring Boot: `server.error.include-stacktrace=never`\n- Django: `DEBUG = False`\n- Express: 커스텀 에러 핸들러에서 스택 트레이스 숨기기',
  },
  'SQL Injection': {
    cause:
      '사용자 입력값이 SQL 쿼리에 직접 삽입되어 있습니다. 공격자가 악의적인 SQL 구문을 주입해 데이터베이스의 모든 데이터를 조회·수정·삭제하거나 서버를 장악할 수 있는 매우 심각한 취약점입니다.',
    remedy:
      '모든 DB 쿼리에 Prepared Statement(파라미터화된 쿼리)를 사용하세요.\n- Java: `PreparedStatement`\n- Python: `cursor.execute("SELECT * FROM t WHERE id=%s", (id,))`\n- ORM 사용 시 raw query 대신 ORM 메서드 활용\n사용자 입력값을 쿼리 문자열에 직접 연결(concatenation)하는 코드를 모두 제거하세요.',
    reference: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
  },
  'Path Traversal': {
    cause:
      '파일 경로에 사용자 입력값(`../` 등)이 포함될 수 있어, 공격자가 서버의 허용되지 않은 디렉토리에 접근해 민감한 파일을 읽거나 실행할 수 있습니다.',
    remedy:
      '파일 경로 구성 시 사용자 입력을 사용하지 않거나, 반드시 사용해야 한다면 허용 목록(화이트리스트)으로 검증하세요.\n`Path.normalize()` 후 허용된 기본 디렉토리 내에 있는지 반드시 확인하세요.',
  },
  'Remote OS Command Injection': {
    cause:
      '사용자 입력값이 OS 명령어 실행에 사용되고 있습니다. 공격자가 악의적인 명령어를 주입해 서버를 완전히 장악할 수 있는 매우 위험한 취약점입니다.',
    remedy:
      'OS 명령어 실행 함수에 사용자 입력값을 직접 전달하지 마세요. 반드시 필요하다면 허용된 명령어 목록만 사용하고, 쉘 인터프리터를 거치지 않는 방식(`execFile` 등)으로 실행하세요.',
  },
  'Absence of Anti-CSRF Tokens - No Known Anti-CSRF Token': {
    cause:
      'HTML 폼에 CSRF 방어 토큰이 없어 크로스 사이트 요청 위조 공격에 취약합니다. 인증된 사용자의 세션을 도용해 의도하지 않은 요청을 서버에 전송할 수 있습니다.',
    remedy:
      '모든 상태 변경 폼에 CSRF 토큰을 추가하거나, `SameSite=Strict` 쿠키 속성으로 보완하세요.',
  },
}

export function getVulnMeta(vulnType: string): VulnMeta | null {
  const exact = meta[vulnType]
  if (exact) return exact
  const key = Object.keys(meta).find((k) => vulnType.toLowerCase().includes(k.toLowerCase()))
  return key ? meta[key] : null
}
