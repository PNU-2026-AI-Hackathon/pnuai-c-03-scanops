package com.scanops.scan;

import java.util.List;

public record PrScanRequest(
        String repo,
        int prNumber,
        List<PrFile> files
) {
    public record PrFile(
            String filename,
            String content,
            String patch
    ) {}
}
