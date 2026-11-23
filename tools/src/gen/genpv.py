# Writes pv/<Name>.js for every component in scripts.json (see pbscripts.py). Run after genjs.py.
import sys,os; sys.path.insert(0,'/home/claude/gen')
import pbscripts as S
for n in S.COMPONENTS: open(os.path.join(S.PV,n+'.js'),'w').write(S.component_script(n))
if S.ERR: raise SystemExit('\n'.join(S.ERR))
