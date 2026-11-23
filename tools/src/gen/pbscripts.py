"""Shared reader for scripts.json: the patchbay.js bundle and every pv/<Name>.js are assembled from the same sources."""
import json,os,re
HERE=os.path.dirname(os.path.abspath(__file__)); PV=os.path.join(HERE,'pv'); INIT=os.path.join(HERE,'init')
M=json.load(open(os.path.join(HERE,'scripts.json')))
BUNDLE=M['bundle']; COMPONENTS=M['components']
def read(p): return open(p).read().strip()+'\n'
def lib(n): return read(os.path.join(PV,n))
def init(n): return read(os.path.join(INIT,n))
HOOK_RE=re.compile(r"^pbHook\('([\w-]+)','((?:[^'\\]|\\.)*)',(\w+)\);$")
def hooks():
    """[(name, selector, function, line)] from pv/_hooks.js, in order."""
    out=[]
    for line in open(os.path.join(PV,'_hooks.js')):
        line=line.strip()
        if not line or line.startswith('/*'): continue
        m=HOOK_RE.match(line)
        if not m: raise SystemExit('pv/_hooks.js: cannot read '+line)
        out.append((m.group(1),m.group(2),m.group(3),line))
    return out
def hooks_header():
    return open(os.path.join(PV,'_hooks.js')).read().split('\n')[0]+'\n'
def defined(src): return set(re.findall(r'\bfunction\s+(pb\w+)\s*\(',src))|set(re.findall(r'\b(?:var|let|const)\s+((?:pb|PB_)\w+)',src))|set(re.findall(r',\s*((?:pb|PB_)\w+)\s*=',src))
def called(src): return set(re.findall(r'(?<![\w.$])(pb[A-Z]\w*)\s*\(',src))-set(re.findall(r'\bfunction\s+(pb\w+)\s*\(',src)) | set(re.findall(r'(?<![\w.$])(PB_\w+)',src))
def bundle_libs(): return ''.join(lib(n) for n in BUNDLE)
def bundle_hooks(): return hooks_header()+''.join(h[3]+'\n' for h in hooks())
def bundle(): return bundle_libs()+bundle_hooks()
ERR=[]
def check(name,src):
    miss=sorted(called(src)-defined(src))
    if miss: ERR.append(f'{name}: uses {", ".join(miss)} but its libs do not define them (scripts.json)')
def component(name):
    """(libs, hooks, glue) for pv/<name>.js. libs always start with _core.js."""
    libs,inits=COMPONENTS[name]
    names=BUNDLE if libs==['ALL'] else ['_core.js']+[l for l in libs if l!='_core.js']
    # Pull in any bundle lib that defines a behavior these libs call (e.g. _misc uses pbToast from _overlay).
    while True:
        lt=''.join(lib(n) for n in names); miss=called(lt)-defined(lt)
        add=[b for b in BUNDLE if b not in names and miss&defined(lib(b))]
        if not add: break
        names.append(add[0])
    have=defined(lt)
    hk=[h for h in hooks() if h[2] in have]
    ht=(hooks_header()+''.join(h[3]+'\n' for h in hk)) if hk else ''
    gt=''.join(init(n) for n in inits)
    return lt,ht,gt
def component_script(name):
    lt,ht,gt=component(name); src=lt+ht+gt+'pbInit();\n'
    check('pv/'+name+'.js',src); return src
def page_glue(name):
    """For a page that already carries the whole bundle: the component's non-bundle libs (e.g. _spark.js) plus its init files."""
    libs,inits=COMPONENTS[name]
    return ''.join(lib(n) for n in libs if n!='ALL' and n not in BUNDLE)+''.join(init(n) for n in inits)
