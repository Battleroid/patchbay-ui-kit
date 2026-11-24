set -e
cd "$(dirname "$0")"
PY="${PB_PY:-python3}"
$PY genjs.py
$PY genpv.py
$PY assemble.py && bash fixh.sh && $PY kit.py >/dev/null
