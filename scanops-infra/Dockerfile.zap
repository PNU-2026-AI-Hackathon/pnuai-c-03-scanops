FROM ghcr.io/zaproxy/zaproxy:stable

COPY --chmod=755 start-zap.sh /start-zap.sh

ENTRYPOINT ["/start-zap.sh"]

EXPOSE 8080
