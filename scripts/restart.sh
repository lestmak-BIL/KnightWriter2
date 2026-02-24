#!/usr/bin/env bash
#
# Restart the KnightWriter dev environment cleanly.
#
# Prerequisites (handled by this script):
# - Run from repo root (script cd's there)
# - Optional: npm install (use --install to ensure deps)
# - Kill any process on port 5173 so Vite can bind
# - Optional: clear Vite cache (use --clean for a full clean start)
#
# Usage:
#   npm run restart
#   npm run restart -- --install    # run npm install before starting
#   npm run restart -- --clean      # clear Vite cache and restart
#   npm run restart -- --install --clean
#   ./scripts/restart.sh [--install] [--clean]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEV_PORT="${DEV_PORT:-5173}"

INSTALL=
CLEAN=

for arg in "$@"; do
  case "$arg" in
    --install) INSTALL=1 ;;
    --clean)   CLEAN=1 ;;
  esac
done

echo "Restarting KnightWriter dev environment..."
cd "$ROOT_DIR"

# 1. Optional: install dependencies
if [ -n "$INSTALL" ]; then
  echo "Installing dependencies..."
  npm install
fi

# 2. Kill anything already on the dev port so Vite can bind
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti ":$DEV_PORT" 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    echo "Stopping process(es) on port $DEV_PORT (PIDs: $PIDS)..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
else
  echo "Warning: lsof not found; skipping port cleanup. If port $DEV_PORT is in use, start may fail."
fi

# 3. Optional: clear Vite cache for a clean build
if [ -n "$CLEAN" ]; then
  echo "Clearing Vite cache..."
  rm -rf node_modules/.vite
  rm -rf dist
fi

# 4. Start the dev server
echo "Starting dev server on port $DEV_PORT..."
exec npm run dev
