#!/usr/bin/env bash
# Rebuild the kit from tools/src into tools/dist (or the directory given).
# Needs: Python 3 (python3 or python; the Windows Store stub is skipped). zip is optional.
# Usage: tools/build.sh [out-dir]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-$HERE/dist}"
mkdir -p "$OUT" && OUT="$(cd "$OUT" && pwd)"

# Pick a Python that actually runs: on Windows `python3` can be a Store stub that only prints "Python was not found".
PB_PY=""
for c in python3 python py; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)' >/dev/null 2>&1; then PB_PY="$c"; break; fi
done
[ -n "$PB_PY" ] || { echo "build.sh: no working Python 3 found (tried python3, python, py)" >&2; exit 1; }
export PB_PY
# Read and write UTF-8 whatever the OS locale is (Windows defaults to cp1252).
export PYTHONUTF8=1

# Generators take their root from their own location (or PB_WORK), so build in a scratch copy and leave tools/src untouched.
WORK="$HERE/.work"
rm -rf "$WORK" && mkdir -p "$WORK"
cp -r "$HERE/src/." "$WORK/"
mkdir -p "$WORK/kit" "$WORK/icons"
export PB_WORK="$WORK"
cd "$WORK/gen"
"$PB_PY" icons.py
"$PB_PY" tokcss.py
bash rebuild_js.sh
"$PB_PY" export.py
# Generated folders are replaced, not merged, so a removed component doesn't linger; a separate output folder is wiped first.
if [ "$OUT" != "$(cd "$HERE/.." && pwd)" ]; then find "$OUT" -mindepth 1 -maxdepth 1 ! -name '.test-results' -exec rm -rf {} +; else rm -rf "$OUT/components"; fi
cp -r "$WORK/export/patchbay/." "$OUT/"
# The zip goes beside the output, except when building over the repo itself or when zip is missing.
if [ "$OUT" != "$(cd "$HERE/.." && pwd)" ]; then
  if [ -f "$WORK/export/patchbay.zip" ]; then cp "$WORK/export/patchbay.zip" "$OUT/../patchbay.zip" 2>/dev/null || true
  else echo "note: zip not installed, skipped patchbay.zip"; fi
fi
echo "Built into $OUT"
