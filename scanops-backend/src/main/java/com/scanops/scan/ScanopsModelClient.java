package com.scanops.scan;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * ScanOps Model API (FastAPI) 클라이언트
 * scripts/api_server.py 서버와 통신
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ScanopsModelClient {

    @Value("${scanops.model.url:http://localhost:8100}")
    private String modelUrl;

    private final WebClient.Builder webClientBuilder;

    public record AnalyzeRequest(String language, String code, String file_path, boolean use_rag) {}

    public record CveReference(String cve_id, String severity, double base_score,
                                String cwe_id, String description) {}

    public record AnalyzeResult(
            String language, String file_path,
            boolean detected, int stage,
            String vulnerability, String severity,
            Double cvss_score,
            String attack, String fix,
            List<CveReference> cve_references,
            double elapsed
    ) {}

    public record BatchRequest(List<AnalyzeRequest> files, boolean stop_on_first) {}

    public record BatchResult(int total, int detected_count,
                               List<AnalyzeResult> results, double elapsed) {}

    /** 코드 단건 분석 — 모델 서버 미연결 시 null 반환 */
    public AnalyzeResult analyze(String language, String code, String filePath) {
        try {
            return webClientBuilder.build()
                    .post()
                    .uri(modelUrl + "/analyze")
                    .bodyValue(new AnalyzeRequest(language, code, filePath, true))
                    .retrieve()
                    .bodyToMono(AnalyzeResult.class)
                    .block();
        } catch (Exception e) {
            log.warn("ScanOps model 서버 미연결 ({}): 단건 분석 생략", e.getMessage());
            return null;
        }
    }

    /** 파일 목록 일괄 분석 (GitHub 레포용) — 모델 서버 미연결 시 빈 결과 반환 */
    public BatchResult analyzeBatch(List<AnalyzeRequest> files) {
        try {
            BatchResult result = webClientBuilder.build()
                    .post()
                    .uri(modelUrl + "/analyze/batch")
                    .bodyValue(new BatchRequest(files, false))
                    .retrieve()
                    .bodyToMono(BatchResult.class)
                    .block();
            return result != null ? result : new BatchResult(0, 0, List.of(), 0);
        } catch (Exception e) {
            log.warn("ScanOps model 서버 미연결 ({}): 분석 없이 완료 처리", e.getMessage());
            return new BatchResult(0, 0, List.of(), 0);
        }
    }

    /** 서버 헬스 체크 */
    public boolean isHealthy() {
        try {
            Map<?, ?> result = webClientBuilder.build()
                    .get()
                    .uri(modelUrl + "/health")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return result != null && "ok".equals(result.get("status"));
        } catch (Exception e) {
            return false;
        }
    }
}
