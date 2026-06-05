FROM ghcr.io/zaproxy/zaproxy:stable

COPY start-zap.sh /start-zap.sh
RUN chmod +x /start-zap.sh

ENTRYPOINT ["/start-zap.sh"]

EXPOSE 8080
