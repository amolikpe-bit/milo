#!/usr/bin/env sh
set -eu

BUN_VERSION="1.4.2"
BUN_BIN=".tools/bun/node_modules/.bin/bun"

if [ ! -x "$BUN_BIN" ] || [ "$("$BUN_BIN" --version)" != "$BUN_VERSION" ]; then
  rm -rf .tools/bun
  npm install --prefix .tools/bun --no-save --package-lock=false "bun@$BUN_VERSION"
fi

if [ -f bun.lock ]; then
  "$BUN_BIN" install --frozen-lockfile
else
  "$BUN_BIN" install
fi
