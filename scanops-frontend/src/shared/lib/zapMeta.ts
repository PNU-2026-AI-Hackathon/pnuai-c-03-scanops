/**
 * ZAP 경보(영어)를 한국어 친화 메타로 변환하는 사전.
 * ZAP 경보 종류는 한정적이라, 흔한 것들을 한국어 이름·한 줄 설명·요약·공격·해결로 매핑한다.
 * 백엔드 AI 메타가 없거나 영어일 때 프론트에서 깔끔한 한글 카드로 보여주기 위함.
 */
export interface ZapMeta {
  name: string
  cwe?: string
  plain: string // "쉽게 말하면"
  summary: string
  attack: string
  fix: string
}

interface Rule { keys: string[]; meta: ZapMeta }

const RULES: Rule[] = [
  {
    keys: ['anti-clickjacking', 'x-frame-options', 'clickjacking'],
    meta: {
      name: '클릭재킹 방지 헤더 누락', cwe: 'CWE-1021',
      plain: '페이지가 투명하게 덧씌워져, 사용자가 모르고 악성 버튼을 누르게 만들 수 있어요.',
      summary: '응답에 X-Frame-Options 또는 CSP frame-ancestors가 없어 클릭재킹에 노출됩니다.',
      attack: '공격자가 우리 페이지를 투명한 iframe으로 덮어, 사용자가 의도치 않은 클릭(결제·삭제 등)을 하도록 유도합니다.',
      fix: "응답 헤더에 X-Frame-Options: DENY(또는 SAMEORIGIN), 혹은 CSP frame-ancestors 'none'을 설정하세요.",
    },
  },
  {
    keys: ['x-content-type-options'],
    meta: {
      name: '콘텐츠 타입 스니핑 방지 헤더 누락', cwe: 'CWE-693',
      plain: '브라우저가 파일 종류를 멋대로 추측해서, 이미지인 척한 악성 스크립트가 실행될 수 있어요.',
      summary: 'X-Content-Type-Options: nosniff가 없어 MIME 스니핑으로 인한 XSS 위험이 있습니다.',
      attack: '브라우저가 Content-Type을 무시하고 응답을 스크립트로 해석하면 악성 코드가 실행됩니다.',
      fix: '응답 헤더에 X-Content-Type-Options: nosniff 를 추가하세요.',
    },
  },
  {
    keys: ['content security policy', 'csp'],
    meta: {
      name: '콘텐츠 보안 정책(CSP) 미설정', cwe: 'CWE-693',
      plain: '악성 스크립트가 끼어들어도 막아줄 “허용 목록”이 없어서 XSS 피해가 커질 수 있어요.',
      summary: 'CSP 헤더가 없어 XSS·데이터 인젝션의 영향 범위가 커집니다.',
      attack: '주입된 스크립트나 외부 리소스 로드를 제한할 정책이 없어 XSS 피해가 확대됩니다.',
      fix: 'Content-Security-Policy 헤더로 script-src 등 신뢰 출처를 명시적으로 제한하세요.',
    },
  },
  {
    keys: ['strict-transport-security', 'hsts'],
    meta: {
      name: 'HSTS 헤더 미설정', cwe: 'CWE-319',
      plain: '사용자가 실수로 http로 접속하면 중간에서 가로채일 수 있어요. https 강제가 안 돼 있어요.',
      summary: 'HSTS가 없어 SSL stripping·다운그레이드 공격에 노출됩니다.',
      attack: '중간자가 https를 http로 다운그레이드해 통신을 가로챌 수 있습니다.',
      fix: 'Strict-Transport-Security: max-age=31536000; includeSubDomains 를 설정하세요.',
    },
  },
  {
    keys: ['httponly'],
    meta: {
      name: '쿠키 HttpOnly 플래그 누락', cwe: 'CWE-1004',
      plain: '로그인 쿠키를 자바스크립트가 읽을 수 있어서, XSS가 생기면 계정을 통째로 탈취당할 수 있어요.',
      summary: '쿠키에 HttpOnly가 없어 스크립트(XSS)로 세션 쿠키가 탈취될 수 있습니다.',
      attack: 'XSS로 document.cookie를 읽어 세션을 탈취합니다.',
      fix: '세션 쿠키에 HttpOnly 속성을 설정하세요.',
    },
  },
  {
    keys: ['secure flag', 'no secure'],
    meta: {
      name: '쿠키 Secure 플래그 누락', cwe: 'CWE-614',
      plain: '로그인 쿠키가 암호화 안 된 http로도 전송돼서, 중간에서 가로채일 수 있어요.',
      summary: '쿠키에 Secure가 없어 평문(HTTP) 전송 시 탈취 위험이 있습니다.',
      attack: 'HTTP 요청에 쿠키가 실려 중간자가 가로챕니다.',
      fix: '쿠키에 Secure 속성을 설정하고 HTTPS만 사용하세요.',
    },
  },
  {
    keys: ['samesite'],
    meta: {
      name: '쿠키 SameSite 속성 누락', cwe: 'CWE-1275',
      plain: '다른 사이트에서 우리 사이트로 요청을 위조하는 CSRF를 막는 설정이 빠졌어요.',
      summary: 'SameSite 속성이 없어 CSRF 위험이 있습니다.',
      attack: '타 사이트에서 위조 요청 시 쿠키가 자동 전송되어 CSRF가 가능합니다.',
      fix: '쿠키에 SameSite=Lax 이상을 설정하세요.',
    },
  },
  {
    keys: ['server leaks version', 'server' /* Server 헤더 */ ],
    meta: {
      name: '서버 버전 정보 노출', cwe: 'CWE-200',
      plain: '서버 종류·버전이 그대로 드러나서, 공격자가 그 버전의 알려진 취약점을 노리기 쉬워져요.',
      summary: 'Server 헤더로 소프트웨어 버전이 노출됩니다.',
      attack: '노출된 버전의 공개 취약점(CVE)을 표적 삼아 공격합니다.',
      fix: 'Server 헤더에서 버전 정보를 제거하거나 숨기세요.',
    },
  },
  {
    keys: ['x-powered-by'],
    meta: {
      name: 'X-Powered-By 정보 노출', cwe: 'CWE-200',
      plain: '사용하는 기술 스택이 노출돼서 공격 표면을 좁혀주는 단서가 돼요.',
      summary: 'X-Powered-By 헤더로 기술 스택이 노출됩니다.',
      attack: '기술 스택을 알아내 표적 공격에 활용합니다.',
      fix: 'X-Powered-By 등 불필요한 정보 노출 헤더를 제거하세요.',
    },
  },
  {
    keys: ['permissions policy', 'permissions-policy', 'feature policy'],
    meta: {
      name: 'Permissions-Policy 헤더 미설정', cwe: 'CWE-693',
      plain: '카메라·위치 같은 브라우저 기능 사용을 제한하는 정책이 없어요.',
      summary: 'Permissions-Policy가 없어 브라우저 기능 오남용을 제한하지 못합니다.',
      attack: '악성 스크립트가 카메라·위치 등 민감 기능 접근을 시도할 수 있습니다.',
      fix: 'Permissions-Policy 헤더로 필요한 기능만 허용하세요.',
    },
  },
  {
    keys: ['timestamp disclosure'],
    meta: {
      name: '타임스탬프 노출', cwe: 'CWE-200',
      plain: '응답에 시간값이 노출돼요. 보통 위험은 낮지만 불필요한 정보가 새는 거예요.',
      summary: '응답에 타임스탬프가 노출됩니다(정보 노출).',
      attack: '노출된 값으로 서버 동작을 추정할 수 있습니다(영향 낮음).',
      fix: '불필요한 타임스탬프 노출을 제거하세요.',
    },
  },
  {
    keys: ['suspicious comments', 'information disclosure'],
    meta: {
      name: '정보 노출 (주석/디버그)', cwe: 'CWE-200',
      plain: '코드 주석이나 디버그 정보가 사용자에게 보여서 내부 정보가 샐 수 있어요.',
      summary: '응답에 개발용 주석·디버그 정보가 포함되어 정보가 노출됩니다.',
      attack: '노출된 단서에서 내부 로직·경로를 파악합니다.',
      fix: '배포 빌드에서 민감한 주석·디버그 출력을 제거하세요.',
    },
  },
  {
    keys: ['cross-domain javascript', 'cross-domain script'],
    meta: {
      name: '외부 도메인 스크립트 포함', cwe: 'CWE-829',
      plain: '다른 도메인의 자바스크립트를 불러오는데, 그 출처가 뚫리면 우리도 위험해져요.',
      summary: '외부 도메인 JS를 로드해 공급망 위험이 있습니다.',
      attack: '외부 스크립트 출처가 변조되면 우리 사이트에서 악성코드가 실행됩니다.',
      fix: 'SRI(무결성 해시)를 적용하거나 신뢰 출처만 사용하세요.',
    },
  },
  {
    keys: ['anti-csrf', 'csrf token'],
    meta: {
      name: 'CSRF 토큰 부재', cwe: 'CWE-352',
      plain: '폼에 위조 방지 토큰이 없어서, 사용자가 모르게 요청이 위조될 수 있어요.',
      summary: 'Anti-CSRF 토큰이 없어 CSRF 공격에 노출됩니다.',
      attack: '타 사이트에서 위조한 폼 전송으로 사용자 행위를 가장합니다.',
      fix: '상태 변경 요청에 CSRF 토큰을 추가하고 검증하세요.',
    },
  },
  {
    keys: ['cache-control', 'cache control'],
    meta: {
      name: '캐시 제어 헤더 점검 필요', cwe: 'CWE-525',
      plain: '민감한 페이지가 캐시에 남아 다른 사람이 볼 수 있을지도 몰라요.',
      summary: 'Cache-Control 설정이 부적절할 수 있습니다.',
      attack: '공유 기기·프록시 캐시에 민감 응답이 남아 노출될 수 있습니다.',
      fix: '민감 응답에 Cache-Control: no-store 를 설정하세요.',
    },
  },
]

const norm = (s: string) => s.toLowerCase()

export function enrichZap(alertName: string): ZapMeta | null {
  const a = norm(alertName)
  for (const r of RULES) {
    if (r.keys.some((k) => a.includes(norm(k)))) return r.meta
  }
  return null
}
