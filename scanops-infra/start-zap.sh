#!/bin/sh
# zap.sh 대신 java 직접 호출 → -Xmx512m 강제 적용 (zap.sh의 메모리 자동 산정 우회)
exec java -Xmx512m \
  -jar /zap/zap.jar \
  -daemon \
  -host 0.0.0.0 \
  -port ${PORT:-8080} \
  -config api.disablekey=true \
  -config api.addrs.addr.name=.* \
  -config api.addrs.addr.regex=true \
  -config api.addrs.addr.enabled=true
