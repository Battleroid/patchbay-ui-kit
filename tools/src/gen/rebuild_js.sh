set -e
cd /home/claude/gen
python3 /home/claude/gen/genjs.py
python3 /home/claude/gen/genpv.py
python3 assemble.py && bash /home/claude/gen/fixh.sh && python3 kit.py >/dev/null
