package com.scanops.scan;

import com.scanops.ai.AiModel;
import com.scanops.vulnerability.RiskLevel;
import com.scanops.vulnerability.Vulnerability;
import com.scanops.vulnerability.VulnerabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * GitHub 레포 스캔 파이프라인
 * 1. GithubScanService → 레포 파일 가져오기
 * 2. ScanopsModelClient → QLoRA 모델 분석
 * 3. 결과를 Vulnerability로 저장
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GithubPipelineRunner {

    private final GithubScanService githubScanService;
    private final ScanJobRepository scanJobRepository;
    private final VulnerabilityService vulnerabilityService;

    // 취약점 유형별 키워드 (줄번호 탐색용)
    private static final Map<String, List<String>> VULN_KEYWORDS = Map.ofEntries(
        Map.entry("xss",                    List.of("innerHTML", "dangerouslySetInnerHTML", "__html", "document.write", "outerHTML", "eval(", "insertAdjacentHTML", "unsafe")),
        Map.entry("cross-site scripting",   List.of("innerHTML", "dangerouslySetInnerHTML", "__html", "document.write", "outerHTML", "eval(")),
        Map.entry("code injection",         List.of("eval(", "new Function(", "execScript")),
        Map.entry("sql injection",          List.of("SELECT", "INSERT", "UPDATE", "DELETE", "executeQuery", "createQuery", "prepareStatement", "nativeQuery")),
        Map.entry("sql",                    List.of("SELECT", "INSERT", "UPDATE", "DELETE", "executeQuery")),
        Map.entry("command injection",      List.of("exec(", "spawn(", "Runtime.exec", "subprocess", "os.system", "shell=True")),
        Map.entry("path traversal",         List.of("readFile", "writeFile", "../", "path.join", "fs.open")),
        Map.entry("hardcoded",              List.of("password", "secret", "api_key", "apikey", "token", "passwd", "credential")),
        Map.entry("cors",                   List.of("Access-Control-Allow-Origin", "cors(", "allowedOrigins")),
        Map.entry("deserialization",        List.of("ObjectInputStream", "readObject", "pickle.loads", "unserialize", "yaml.load")),
        Map.entry("ssrf",                   List.of("fetch(", "axios.get", "WebClient", "HttpClient", "URL(", "open(")),
        Map.entry("xxe",                    List.of("DocumentBuilder", "XMLReader", "SAXParser", "parseXML"))
    );

    /** 코드에서 취약 라인 번호 목록 탐색 (1-indexed, 없으면 빈 리스트) */
    private List<Integer> findVulnLines(String code, String vulnType) {
        List<Integer> found = new ArrayList<>();
        if (code == null || code.isBlank() || vulnType == null) return found;
        String key = vulnType.toLowerCase();
        List<String> keywords = VULN_KEYWORDS.entrySet().stream()
                .filter(e -> key.contains(e.getKey()))
                .flatMap(e -> e.getValue().stream())
                .toList();
        if (keywords.isEmpty()) return found;
        String[] lines = code.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String lc = lines[i].toLowerCase();
            if (keywords.stream().anyMatch(kw -> lc.contains(kw.toLowerCase()))) {
                found.add(i + 1);
            }
        }
        return found;
    }

    @Async
    public void run(ScanJob job) {
        log.info("[GitHub 스캔] 시작: {}", job.getTargetUrl());
        try {
            job.setStatus(ScanStatus.RUNNING);
            scanJobRepository.save(job);

            GithubScanService.ScanResult scan =
                    githubScanService.scanRepo(job.getTargetUrl());
            ScanopsModelClient.BatchResult result = scan.batch();
            java.util.Map<String, String> fileContents = scan.fileContents();

            // 탐지된 취약점만 저장
            for (ScanopsModelClient.AnalyzeResult r : result.results()) {
                if (!r.detected()) continue;

                String cveDesc = r.cve_references().isEmpty() ? ""
                        : r.cve_references().stream()
                            .map(c -> c.cve_id() + " (" + c.severity() + ")")
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("");

                // 취약 라인 목록 탐색 — 같은 유형이 여러 줄에 있으면 각각 저장
                List<Integer> lineNums = findVulnLines(
                        fileContents.getOrDefault(r.file_path(), ""),
                        r.vulnerability()
                );

                if (lineNums.isEmpty()) {
                    // 라인을 못 찾은 경우 1개만 저장
                    Vulnerability vuln = Vulnerability.builder()
                            .jobId(job.getId())
                            .vulnType(r.vulnerability())
                            .riskLevel(mapRiskLevel(r.severity()))
                            .description("파일: " + r.file_path()
                                    + "\n공격: " + r.attack()
                                    + (cveDesc.isEmpty() ? "" : "\n관련 CVE: " + cveDesc))
                            .solution(r.fix())
                            .url(job.getTargetUrl() + "/blob/HEAD/" + r.file_path())
                            .aiModel(AiModel.CUSTOM)
                            .build();
                    vulnerabilityService.save(vuln);
                } else {
                    for (int lineNum : lineNums) {
                        Vulnerability vuln = Vulnerability.builder()
                                .jobId(job.getId())
                                .vulnType(r.vulnerability())
                                .riskLevel(mapRiskLevel(r.severity()))
                                .description("파일: " + r.file_path()
                                        + "\n줄번호: " + lineNum
                                        + "\n공격: " + r.attack()
                                        + (cveDesc.isEmpty() ? "" : "\n관련 CVE: " + cveDesc))
                                .solution(r.fix())
                                .url(job.getTargetUrl() + "/blob/HEAD/" + r.file_path() + "#L" + lineNum)
                                .aiModel(AiModel.CUSTOM)
                                .build();
                        vulnerabilityService.save(vuln);
                    }
                }
            }

            job.setStatus(ScanStatus.DONE);
            job.setFinishedAt(LocalDateTime.now());
            scanJobRepository.save(job);

            log.info("[GitHub 스캔] 완료: 취약점 {}개 발견 / 총 {}개 파일",
                    result.detected_count(), result.total());

        } catch (Exception e) {
            log.error("[GitHub 스캔] 실패: {}", e.getMessage(), e);
            job.setStatus(ScanStatus.FAILED);
            job.setFinishedAt(LocalDateTime.now());
            scanJobRepository.save(job);
        }
    }

    private RiskLevel mapRiskLevel(String severity) {
        if (severity == null) return RiskLevel.INFORMATIONAL;
        return switch (severity.toUpperCase()) {
            case "HIGH", "CRITICAL" -> RiskLevel.HIGH;
            case "MEDIUM" -> RiskLevel.MEDIUM;
            case "LOW" -> RiskLevel.LOW;
            default -> RiskLevel.INFORMATIONAL;
        };
    }
}
