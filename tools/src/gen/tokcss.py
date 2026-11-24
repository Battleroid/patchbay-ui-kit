import os as _os
ROOT=(_os.environ.get('PB_WORK') or _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))).replace(_os.sep,'/')
import json,sys; sys.path.insert(0,ROOT+'/gen')
from tokcss_lib import tokens_css
T=json.load(open(ROOT+'/ds/project/tokens.json'))
fp=lambda f: ('local'+f) if 'Obel' in f else '../ds/project/'+f
open(ROOT+'/gen/tokens.css','w').write(tokens_css(T,fp))
