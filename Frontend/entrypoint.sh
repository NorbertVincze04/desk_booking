#!/bin/sh
set -e

# Proxy env vars are baked in at build time (needed for npm install in Dockerfile).
# Unset them at runtime so ng serve doesn't route HMR/WebSocket traffic through
# the corporate proxy.
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY

echo "Starting Angular dev server on port 4200..."
# --host 0.0.0.0       : bind to all interfaces so the browser can reach the container
# --port 4200          : must match EXPOSE in Dockerfile and ports: in docker-compose.yml
# --poll 2000          : polling-based watch required for WSL2/Windows bind-mount volumes
# --disable-host-check : allow WebSocket live-reload connections from any host origin
exec npx ng serve --host 0.0.0.0 --port 4200 --poll 2000 --disable-host-check
 