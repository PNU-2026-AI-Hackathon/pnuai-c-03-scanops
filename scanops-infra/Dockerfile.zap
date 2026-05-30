FROM ghcr.io/zaproxy/zaproxy:stable

CMD ["sh", "-c", "zap.sh -daemon \
     -host 0.0.0.0 \
     -port $PORT \
     -config api.addrs.addr.name=.* \
     -config api.addrs.addr.regex=true \
     -config api.disablekey=true"]

EXPOSE 8080
