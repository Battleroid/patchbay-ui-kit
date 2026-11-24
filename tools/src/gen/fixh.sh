cd "$(dirname "$0")" && ${PB_PY:-python3} assemble.py && ${PB_PY:-python3} build.py >/dev/null && ${PB_PY:-python3} - <<'P'
import json,glob,os
R=os.path.dirname(os.getcwd()).replace(os.sep,'/')
ph=json.load(open(R+'/gen/photoids.json'))
for f in glob.glob(R+'/gen/h/*.html'):
    s=open(f).read().replace('/_blob/557011fafc2e689aab4bcb66f9c7ebf9',R+'/media/sample.mp4').replace('/_blob/941b14fb8502a96c7f8d37427890c74d',R+'/media/poster.jpg')
    for k,v in ph.items(): s=s.replace('/_blob/'+v,R+'/media/'+k+'.jpg')
    open(f,'w').write(s)
P
