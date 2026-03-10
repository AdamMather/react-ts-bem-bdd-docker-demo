#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HOST="127.0.0.1"
PORT="3000"
BASE_URL="http://${HOST}:${PORT}"

cleanup() {
  if [[ -n "${VITE_PID:-}" ]] && kill -0 "$VITE_PID" 2>/dev/null; then
    kill "$VITE_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting Vite server for Gherkin execution at ${BASE_URL}..."
npm run dev -- --host "$HOST" --port "$PORT" --strictPort >/tmp/vite-gherkin.log 2>&1 &
VITE_PID=$!

echo "Waiting for Vite server readiness..."
for attempt in $(seq 1 45); do
  if curl -fsS "$BASE_URL" >/dev/null 2>&1; then
    echo "Vite is ready. Running Cucumber scenarios..."
    cucumber-js tests/features --require tests/step_definitions/**/*.js --format progress
    exit 0
  fi

  if ! kill -0 "$VITE_PID" 2>/dev/null; then
    echo "Vite process exited before readiness."
    cat /tmp/vite-gherkin.log || true
    exit 1
  fi

  sleep 1
done

echo "Vite server did not become ready in time."
cat /tmp/vite-gherkin.log || true
exit 1
