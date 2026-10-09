#!/usr/bin/env bash
set -eu
if [ -f /workspace/kottomkt/creative-rebuild/package-lock.json ]; then
  cd /workspace/kottomkt/creative-rebuild
  npm ci --ignore-scripts --cache /tmp/kotto-npm-cache
  npm run build
fi
