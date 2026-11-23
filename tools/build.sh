#!/usr/bin/env bash
# Rebuild the kit from tools/src into tools/dist (or the directory given).
# Needs: python3, zip. Usage: tools/build.sh [out-dir]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-$HERE/dist}"
mkdir -p "$OUT" && OUT="$(cd "$OUT" && pwd)"
WORK="$HERE/.work"
rm -rf "$WORK" && mkdir -p "$WORK"
cp -r "$HERE/src/." "$WORK/"
# The generator scripts were written with absolute paths; point them at the work dir.
grep -rlI '/home/claude/' "$WORK" | while read -r f; do sed -i.bak "s#/home/claude/#$WORK/#g" "$f" && rm -f "$f.bak"; done
mkdir -p "$WORK/kit" "$WORK/icons"
cd "$WORK/gen"
python3 icons.py
python3 tokcss.py
bash rebuild_js.sh
python3 export.py
# export.py copies the sources back out; undo the work-dir paths so tools/src stays portable.
grep -rlI "$WORK/" "$WORK/export/patchbay/tools" | while read -r f; do sed -i.bak "s#$WORK/#/home/claude/#g" "$f" && rm -f "$f.bak"; done
cp -r "$WORK/export/patchbay/." "$OUT/"
# The zip goes beside the output, except when building over the repo itself.
if [ "$OUT" != "$(cd "$HERE/.." && pwd)" ]; then cp "$WORK/export/patchbay.zip" "$OUT/../patchbay.zip" 2>/dev/null || true; fi
echo "Built into $OUT"
