import json,re,os
def cv(v):
    m=re.fullmatch(r'\{(.+)\}',v); return f'var(--{m.group(1)})' if m else v
def tokens_css(T,fontpath):
    th=[x['id'] for x in T['color']['themes']]; out=[]
    for i,t in enumerate(th):
        sel=(':root, ' if i==0 else '')+f'[data-theme="{t}"]'; L=[sel+' {']
        for fam in (T['color']['tokens'],T['shadow']['tokens'],T.get('focus',{}).get('tokens',[])):
            for k in fam:
                v=k['value']
                if isinstance(v,dict):
                    if t in v: L.append(f'  --{k["name"]}: {cv(v[t])};')
                    elif i==0: L.append(f'  --{k["name"]}: {cv(list(v.values())[0])};')
                elif i==0: L.append(f'  --{k["name"]}: {cv(v)};')
                elif v.startswith('{'): L.append(f'  --{k["name"]}: {cv(v)};')
        L.append('}'); out.append('\n'.join(L))
    L=[':root {']
    for fam in ('spacing','radius','stroke','size','text','motion','layer'):
        for k in T.get(fam,{}).get('tokens',[]): L.append(f'  --{k["name"]}: {k["value"]};')
    for k,v in T['type']['families'].items(): L.append(f'  --font-{k}: {v};')
    L.append('}'); out.append('\n'.join(L))
    for f in T['type']['fonts']:
        out.append(f'@font-face {{ font-family: "{f["family"]}"; src: url("{fontpath(f["file"])}") format("woff2"); font-weight: {f["weight"]}; font-style: {f["style"]}; font-display: swap; }}')
    return '\n'.join(out)
