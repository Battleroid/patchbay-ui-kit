cd /home/claude/gen && python3 assemble.py && python3 build.py >/dev/null && python3 - <<'P'
import json,glob
ph=json.load(open('/home/claude/gen/photoids.json'))
for f in glob.glob('/home/claude/gen/h/*.html'):
    s=open(f).read().replace('/_blob/557011fafc2e689aab4bcb66f9c7ebf9','/home/claude/media/sample.mp4').replace('/_blob/941b14fb8502a96c7f8d37427890c74d','/home/claude/media/poster.jpg')
    for k,v in ph.items(): s=s.replace('/_blob/'+v,'/home/claude/media/'+k+'.jpg')
    open(f,'w').write(s)
P
