FROM ghcr.io/zaproxy/zaproxy:stable

# ZAP 메모리 자동 산정 bypass: zap.sh 대신 java 직접 호출로 -Xmx512m 강제
# DNS rebinding 방지 우회: config.xml 선탑재로 모든 호스트 허용
RUN mkdir -p /home/zap/.ZAP
COPY zap-config.xml /home/zap/.ZAP/config.xml

COPY --chmod=755 start-zap.sh /start-zap.sh

ENTRYPOINT ["/start-zap.sh"]

EXPOSE 8080
