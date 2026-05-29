#!/usr/bin/env bash
# ACE setup — runs BEFORE services start or restart.
# Invoked by `POST /api/run-setup`, the local engine file watcher, and `ace run`.
# Must be idempotent (safe to run many times). The DevLay agent builds the app;
# this just makes sure deps are installed before the engine starts services.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "${REPO_ROOT}"

echo "[ace-setup] installing dependencies…"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
elif command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "[ace-setup] no package manager found — skipping install"
fi

echo "[ace-setup] done"
