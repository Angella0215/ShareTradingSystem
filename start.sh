#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm --prefix backend run dev &
API_PID=$!
npm --prefix frontend run dev &
WEB_PID=$!
trap 'kill "$API_PID" "$WEB_PID" 2>/dev/null || true' EXIT
printf '\nReact app: http://localhost:5173\nAPI status: http://localhost:5000/api/health\nPress Ctrl+C to stop.\n\n'
wait
