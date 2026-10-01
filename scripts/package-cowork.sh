#!/usr/bin/env bash
# Packages the Claude plugin as a .plugin file (a zip) for Claude Cowork, which
# installs plugins from an uploaded file. Pass a URL to point it at another MCP
# endpoint, e.g. a dev server:
#
#   scripts/package-cowork.sh                                   # -> dist/menumap.plugin
#   scripts/package-cowork.sh http://localhost:3000/mcp         # -> dist/menumap-dev.plugin
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
url="${1:-}"
out_dir="${OUT_DIR:-$root/dist}"
mkdir -p "$out_dir"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
cp -R "$root/claude/menumap/." "$stage/"
name="menumap"
if [ -n "$url" ]; then
  python3 - "$stage/.mcp.json" "$url" <<'PY'
import json, sys
path, url = sys.argv[1], sys.argv[2]
cfg = json.load(open(path))
cfg["mcpServers"]["menumap"]["url"] = url
json.dump(cfg, open(path, "w"), indent=2)
PY
  name="menumap-dev"
fi
rm -f "$out_dir/$name.plugin"
(cd "$stage" && zip -qr "$out_dir/$name.plugin" . -x "*.DS_Store")
echo "$out_dir/$name.plugin"
