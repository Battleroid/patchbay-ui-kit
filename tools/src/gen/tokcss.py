import json,sys; sys.path.insert(0,'/home/claude/gen')
from tokcss_lib import tokens_css
T=json.load(open('/home/claude/ds/project/tokens.json'))
fp=lambda f: ('/home/claude/gen/local'+f) if 'Obel' in f else '/home/claude/ds/project/'+f
open('/home/claude/gen/tokens.css','w').write(tokens_css(T,fp))
