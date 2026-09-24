#!/bin/sh
set -e

# Proxy env vars are used at build time for npm installs; unset them at runtime
# to avoid routing local app traffic through a corporate proxy.
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY

echo "Starting backend server on port 3000..."
# Bind to 0.0.0.0 via env so the service is reachable outside the container.
# Note: src/server.ts opens a CF tunnel on startup; ensure required CF setup is available.
export PORT="${PORT:-3000}"

exec npx tsx src/server.ts
