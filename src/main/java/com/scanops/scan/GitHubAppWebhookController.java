package com.scanops.scan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.openssl.PEMKeyPair;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.time.Instant;
import java.util.*;

/**
 * GitHub App Webhook 수신 → PR 자동 보안 스캔
 * POST /api/github/webhook
 */
@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Slf4j
public class GitHubAppWebhookController {

    @Value("${github.app.id:}")
    private String appId;

    @Value("${github.app.private-key:}")
    private String privateKeyPem;

    @Value("${github.webhook.secret:}")
    private String webhookSecret;

    private final ScanopsModelClient modelClient;
    private final GithubScanService githubScanService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> TARGET_EXTS = Set.of(
        ".java", ".kt", ".jsx", ".tsx", ".js", ".ts",
        ".py", ".go", ".rs", ".c", ".cpp", ".php", ".rb"
    );

    // ── Webhook 수신 ──────────────────────────────────────────────────────────

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "") String event,
            @RequestHeader(value = "X-Hub-Signature-256", defaultValue = "") String signature,
            @RequestBody String payload) {

        // 서명 검증
        if (!webhookSecret.isBlank() && !verifySignature(payload, signature)) {
            log.warn("[Webhook] 서명 검증 실패");
            return ResponseEntity.status(401).body("Invalid signature");
        }

        if (!"pull_request".equals(event)) {
            return ResponseEntity.ok("ignored");
        }

        try {
            JsonNode root   = objectMapper.readTree(payload);
            String action   = root.path("action").asText();

            // opened / synchronize / reopened 만 처리
            if (!Set.of("opened", "synchronize", "reopened").contains(action)) {
                return ResponseEntity.ok("ignored action: " + action);
            }

            long   installationId = root.path("installation").path("id").asLong();
            int    prNumber       = root.path("number").asInt();
            String repoFullName   = root.path("repository").path("full_name").asText();
            String headSha        = root.path("pull_request").path("head").path("sha").asText();

            log.info("[Webhook] PR #{} repo={} action={}", prNumber, repoFullName, action);

            // 비동기 처리 (webhook 응답은 즉시 반환)
            new Thread(() -> processPr(installationId, repoFullName, prNumber, headSha)).start();

        } catch (Exception e) {
            log.error("[Webhook] 파싱 오류: {}", e.getMessage());
        }

        return ResponseEntity.ok("ok");
    }

    // ── PR 처리 ───────────────────────────────────────────────────────────────

    private void processPr(long installationId, String repo, int prNumber, String headSha) {
        try {
            String token = getInstallationToken(installationId);
            if (token == null) { log.error("[Webhook] 토큰 발급 실패"); return; }

            WebClient gh = WebClient.builder()
                    .baseUrl("https://api.github.com")
                    .defaultHeader("Authorization", "Bearer " + token)
                    .defaultHeader("Accept", "application/vnd.github+json")
                    .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                    .build();

            // owner/repo 분리 (슬래시 URL 인코딩 방지)
            String[] parts = repo.split("/", 2);
            String owner = parts[0];
            String repoName = parts[1];

            // 변경 파일 목록
            JsonNode filesNode = gh.get()
                    .uri("/repos/{owner}/{repo}/pulls/{pr}/files?per_page=50", owner, repoName, prNumber)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (filesNode == null || !filesNode.isArray()) {
                log.warn("[Webhook] PR 파일 목록 없음 또는 배열 아님: {}", filesNode);
                return;
            }

            List<JsonNode> changedFiles = new ArrayList<>();
            filesNode.forEach(changedFiles::add);

            if (changedFiles == null || changedFiles.isEmpty()) return;

            // 분석 대상 필터
            List<ScanopsModelClient.AnalyzeRequest> requests = new ArrayList<>();
            Map<String, String> patchMap = new HashMap<>();

            for (JsonNode f : changedFiles) {
                String filename = f.path("filename").asText();
                String status   = f.path("status").asText();
                if ("removed".equals(status)) continue;

                String ext = filename.contains(".")
                        ? filename.substring(filename.lastIndexOf('.')).toLowerCase()
                        : "";
                if (!TARGET_EXTS.contains(ext)) continue;

                // 파일 내용 가져오기
                try {
                    String contentB64 = gh.get()
                            .uri("/repos/{owner}/{repo}/contents/{path}?ref={sha}", owner, repoName, filename, headSha)
                            .retrieve()
                            .bodyToMono(JsonNode.class)
                            .block()
                            .path("content").asText()
                            .replaceAll("\\s", "");

                    String content = new String(Base64.getDecoder().decode(contentB64), StandardCharsets.UTF_8);
                    if (content.length() > 10000) content = content.substring(0, 10000);

                    String lang = githubScanService.detectLanguage(filename);
                    if (lang == null) continue;

                    requests.add(new ScanopsModelClient.AnalyzeRequest(lang, content, filename, true));
                    patchMap.put(filename, f.path("patch").asText(""));

                } catch (Exception e) {
                    log.warn("[Webhook] 파일 읽기 실패: {}", filename);
                }
            }

            if (requests.isEmpty()) return;

            // 분석
            ScanopsModelClient.BatchResult batch = modelClient.analyzeBatch(requests);

            // 취약점 없으면 클린 댓글
            long vulnCount = batch.results().stream().filter(ScanopsModelClient.AnalyzeResult::detected).count();
            if (vulnCount == 0) {
                postComment(gh, owner, repoName, prNumber,
                    "## 🔒 ScanOps 보안 스캔 결과\n\n✅ **취약점이 발견되지 않았습니다.**\n\n" +
                    "분석 파일: **" + batch.total() + "개**\n\n> Powered by [ScanOps](https://github.com/26Graduation)");
                return;
            }

            // 요약 + 인라인 댓글
            List<Map<String, Object>> comments = new ArrayList<>();
            StringBuilder summary = new StringBuilder();
            summary.append("## 🔍 ScanOps 보안 스캔 결과\n\n")
                   .append("> **").append(vulnCount).append("개 취약점 발견** | 분석 파일: ")
                   .append(batch.total()).append("개\n\n")
                   .append("| 심각도 | 파일 | 취약점 유형 |\n|--------|------|------------|\n");

            for (ScanopsModelClient.AnalyzeResult r : batch.results()) {
                if (!r.detected()) continue;

                String emoji = severityEmoji(r.severity());
                String cvss  = r.cvss_score() != null ? " (CVSS " + r.cvss_score() + ")" : "";
                summary.append("| ").append(emoji).append(" **").append(r.severity()).append(cvss)
                       .append("** | `").append(r.file_path()).append("` | ")
                       .append(r.vulnerability()).append(" |\n");

                // 인라인 댓글
                String patch = patchMap.get(r.file_path());
                List<Integer> lines = findVulnLines(patch, r.vulnerability());
                if (lines.isEmpty()) lines = List.of(extractFirstLine(patch));

                String cveText = r.cve_references().stream()
                        .limit(3)
                        .map(c -> "- `" + c.cve_id() + "` (" + c.severity() + ", " + c.cwe_id() + ")")
                        .reduce("", (a, b) -> a + "\n" + b);

                for (int line : lines) {
                    if (line <= 0) continue;
                    String body = buildCommentBody(emoji, r, line, cveText);
                    Map<String, Object> comment = new HashMap<>();
                    comment.put("path", r.file_path());
                    comment.put("line", line);
                    comment.put("body", body);
                    comment.put("side", "RIGHT");
                    comments.add(comment);
                }
            }

            summary.append("\n> Powered by [ScanOps](https://github.com/26Graduation)");

            // PR Review 제출
            try {
                Map<String, Object> review = new HashMap<>();
                review.put("commit_id", headSha);
                review.put("body", summary.toString());
                review.put("event", "COMMENT");
                review.put("comments", comments);

                gh.post()
                  .uri("/repos/{owner}/{repo}/pulls/{pr}/reviews", owner, repoName, prNumber)
                  .bodyValue(review)
                  .retrieve()
                  .bodyToMono(String.class)
                  .block();

            } catch (Exception e) {
                // 인라인 실패 시 일반 댓글로 fallback
                log.warn("[Webhook] 인라인 댓글 실패, 일반 댓글로 대체: {}", e.getMessage());
                postComment(gh, owner, repoName, prNumber, summary.toString());
            }

            log.info("[Webhook] PR #{} 스캔 완료: 취약점 {}개", prNumber, vulnCount);

        } catch (Exception e) {
            log.error("[Webhook] processPr 오류: {}", e.getMessage(), e);
        }
    }

    // ── GitHub App JWT / 토큰 ─────────────────────────────────────────────────

    private String generateJwt() throws Exception {
        // 환경변수에서 \n이 리터럴로 들어온 경우 실제 줄바꿈으로 변환
        String pem = privateKeyPem
                .replace("\\n", "\n")
                .replace("\\r", "")
                .trim();

        // PEM 헤더/푸터가 없으면 추가
        if (!pem.contains("-----BEGIN")) {
            pem = "-----BEGIN RSA PRIVATE KEY-----\n" + pem + "\n-----END RSA PRIVATE KEY-----";
        }

        log.debug("[Webhook] PEM 첫 줄: {}", pem.split("\n")[0]);

        PEMParser parser = new PEMParser(new StringReader(pem));
        Object obj = parser.readObject();
        parser.close();

        if (obj == null) {
            throw new IllegalArgumentException("PEM 파싱 실패: obj is null. PEM 형식을 확인하세요.");
        }

        PrivateKey privateKey;
        if (obj instanceof PEMKeyPair keyPair) {
            privateKey = new JcaPEMKeyConverter().getKeyPair(keyPair).getPrivate();
        } else {
            throw new IllegalArgumentException("Unsupported PEM object: " + obj.getClass());
        }

        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(appId)
                .issuedAt(Date.from(now.minusSeconds(60)))
                .expiration(Date.from(now.plusSeconds(540)))
                .signWith(privateKey)
                .compact();
    }

    private String getInstallationToken(long installationId) {
        try {
            String jwt = generateJwt();
            JsonNode resp = WebClient.builder()
                    .baseUrl("https://api.github.com")
                    .defaultHeader("Authorization", "Bearer " + jwt)
                    .defaultHeader("Accept", "application/vnd.github+json")
                    .build()
                    .post()
                    .uri("/app/installations/{id}/access_tokens", installationId)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            return resp != null ? resp.path("token").asText() : null;
        } catch (Exception e) {
            log.error("[Webhook] JWT/토큰 발급 오류: {}", e.getMessage(), e);
            return null;
        }
    }

    // ── 헬퍼 ─────────────────────────────────────────────────────────────────

    private void postComment(WebClient gh, String owner, String repoName, int pr, String body) {
        try {
            gh.post()
              .uri("/repos/{owner}/{repo}/issues/{pr}/comments", owner, repoName, pr)
              .bodyValue(Map.of("body", body))
              .retrieve()
              .bodyToMono(String.class)
              .block();
        } catch (Exception e) {
            log.error("[Webhook] 댓글 작성 실패: {}", e.getMessage());
        }
    }

    private String buildCommentBody(String emoji, ScanopsModelClient.AnalyzeResult r, int line, String cveText) {
        String cvssLine = r.cvss_score() != null ? "\n**CVSS Score:** " + r.cvss_score() : "";
        return "### " + emoji + " [ScanOps] " + r.vulnerability() + "\n" +
               "**파일:** `" + r.file_path() + "` | **심각도:** " + r.severity() + cvssLine + "\n" +
               "**위치:** " + line + "번째 줄 (변경된 코드)\n\n" +
               "**공격 시나리오:**\n" + r.attack() + "\n\n" +
               "**수정 방법:**\n" + r.fix() +
               (cveText.isBlank() ? "" : "\n\n**관련 CVE:**\n" + cveText);
    }

    private String severityEmoji(String sev) {
        if (sev == null) return "⚠️";
        return switch (sev.toUpperCase()) {
            case "CRITICAL", "HIGH" -> "🔴";
            case "MEDIUM" -> "🟡";
            case "LOW"    -> "🟢";
            default       -> "⚠️";
        };
    }

    private static final Map<String, List<String>> VULN_KEYWORDS = Map.ofEntries(
        Map.entry("ssrf",              List.of("fetch(", "axios.get", "webclient", "httpclient", "url(", "open(")),
        Map.entry("xss",               List.of("innerhtml", "dangerouslysetinnerhtml", "__html", "document.write", "eval(")),
        Map.entry("cross-site scripting", List.of("innerhtml", "dangerouslysetinnerhtml", "document.write", "eval(")),
        Map.entry("code injection",    List.of("eval(", "new function(", "settimeout(", "setinterval(")),
        Map.entry("injection",         List.of("eval(", "new function(")),
        Map.entry("sql injection",     List.of("select ", "insert ", "update ", "delete ", "executequery")),
        Map.entry("command injection", List.of("exec(", "spawn(", "os.system", "subprocess")),
        Map.entry("path traversal",    List.of("readfile", "writefile", "../", "path.join")),
        Map.entry("hardcoded",         List.of("password", "secret", "api_key", "apikey", "token")),
        Map.entry("xxe",               List.of("documentbuilder", "xmlreader", "saxparser"))
    );

    private List<Integer> findVulnLines(String patch, String vulnType) {
        if (patch == null || patch.isBlank() || vulnType == null) return List.of();
        String key = vulnType.toLowerCase();
        List<String> keywords = VULN_KEYWORDS.entrySet().stream()
                .filter(e -> key.contains(e.getKey()))
                .flatMap(e -> e.getValue().stream())
                .toList();
        if (keywords.isEmpty()) return List.of();

        List<Integer> matched = new ArrayList<>();
        int lineNum = 0;
        for (String raw : patch.split("\n")) {
            var header = java.util.regex.Pattern.compile("@@ -\\d+(?:,\\d+)? \\+(\\d+)").matcher(raw);
            if (header.find()) { lineNum = Integer.parseInt(header.group(1)) - 1; continue; }
            if (raw.startsWith("-")) continue;
            lineNum++;
            if (raw.startsWith("+")) {
                String lc = raw.substring(1).toLowerCase();
                if (keywords.stream().anyMatch(lc::contains)) matched.add(lineNum);
            }
        }
        return matched;
    }

    private int extractFirstLine(String patch) {
        if (patch == null) return 0;
        var m = java.util.regex.Pattern.compile("@@ -\\d+(?:,\\d+)? \\+(\\d+)").matcher(patch);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = "sha256=" + HexFormat.of().formatHex(hash);
            return expected.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
