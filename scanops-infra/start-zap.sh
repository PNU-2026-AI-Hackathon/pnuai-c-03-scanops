#!/bin/sh
exec zap.sh -Xmx512m \
  -daemon \
  -host 0.0.0.0 \
  -port ${PORT:-8080} \
  -config api.disablekey=true \
  -config api.addrs.addr.name=.* \
  -config api.addrs.addr.regex=true \
  -config api.addrs.addr.enabled=true
