#!/bin/sh
# ZAP이 /proc/meminfo 기준으로 JVM 힙을 자동 산정하면 Railway 컨테이너 한도를 초과함
# _ZAP_MEM 으로 명시 지정 (단위: MB)
export _ZAP_MEM=512

exec zap.sh -daemon \
  -host 0.0.0.0 \
  -port ${PORT:-8080} \
  -config api.addrs.addr.name=.* \
  -config api.addrs.addr.regex=true \
  -config api.disablekey=true
