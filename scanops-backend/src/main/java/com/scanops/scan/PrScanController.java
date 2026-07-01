package com.scanops.scan;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * GitHub Action에서 호출하는 PR diff 보안 스캔 엔드포인트
 * POST /api/github/pr-scan
 */
@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Slf4j
public class PrScanController {

    @Value("${scanops.api-key:}")
    private String apiKey;

    private final ScanopsModelClient modelClient;
    private final GithubScanService githubScanService;

    @PostMapping("/pr-scan")
    public ResponseEntity<?> scanPr(
            @RequestHeader(value = "X-Scanops-Key", required = false) String key,
            @RequestBody PrScanRequest req) {

        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals(key)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid API key"));
        }

        log.info("[PR 스캔] repo={} pr={} files={}",
                req.repo(), req.prNumber(), req.files().size());

        List<ScanopsModelClient.AnalyzeRequest> requests = req.files().stream()
                .filter(f -> f.content() != null && !f.content().isBlank())
                .map(f -> {
                    String lang = githubScanService.detectLanguage(f.filename());
                    return lang == null ? null
                            : new ScanopsModelClient.AnalyzeRequest(lang, f.content(), f.filename(), true);
                })
                .filter(r -> r != null)
                .toList();

        if (requests.isEmpty()) {
            return ResponseEntity.ok(new PrScanResponse(
                    req.repo(), req.prNumber(), 0, 0, List.of(), 0));
        }

        ScanopsModelClient.BatchResult batch = modelClient.analyzeBatch(requests);

        // AnalyzeResult → PrScanFinding 변환 (patch의 diff_line은 Action이 전달)
        List<PrScanFinding> findings = batch.results().stream()
                .map(r -> {
                    Integer diffLine = req.files().stream()
                            .filter(f -> f.filename().equals(r.file_path()))
                            .findFirst()
                            .map(f -> extractFirstAddedLine(f.patch()))
                            .orElse(null);
                    return new PrScanFinding(
                            r.file_path(),
                            r.detected(),
                            r.vulnerability(),
                            r.severity(),
                            r.cvss_score(),
                            r.attack(),
                            r.fix(),
                            r.cve_references(),
                            diffLine
                    );
                })
                .toList();

        PrScanResponse response = new PrScanResponse(
                req.repo(), req.prNumber(),
                batch.total(), batch.detected_count(),
                findings, batch.elapsed());

        log.info("[PR 스캔] 완료: 취약점 {}개 / {}개 파일", batch.detected_count(), batch.total());
        return ResponseEntity.ok(response);
    }

    /** patch 문자열에서 첫 번째 추가 라인 번호 추출 (@@ -n,m +start ... 형식) */
    private Integer extractFirstAddedLine(String patch) {
        if (patch == null || patch.isBlank()) return null;
        var matcher = java.util.regex.Pattern.compile("@@ -\\d+(?:,\\d+)? \\+(\\d+)").matcher(patch);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : null;
    }
}
