FROM ghcr.io/zaproxy/zaproxy:stable

# ZAP 메모리 자동 산정 방지 — Railway /proc/meminfo에서 호스트 전체 메모리를 읽어
# JVM 힙을 64GB로 잡는 문제 수정. ZAP zap.sh 내부 변수로 512MB 강제 지정.
ENV _ZAP_MEM=512

COPY --chmod=755 start-zap.sh /start-zap.sh

ENTRYPOINT ["/start-zap.sh"]

EXPOSE 8080
