import os, json, urllib.parse
OUT='/home/claude/icons'
# each icon: list of elements; tuples (soft, hard) where they differ
def frame(e): return '<circle cx="12" cy="12" r="9"/>' if e=='soft' else '<rect x="3" y="3" width="18" height="18"/>'
def rr(x,y,w,h,r,e): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}"' + (f' rx="{r}"' if e=='soft' else '') + '/>'
P=lambda d: f'<path d="{d}"/>'
I={
 'status-ok':     lambda e: frame(e)+P('M8 12.5l2.75 2.75L16 9.5'),
 'status-warn':   lambda e: P('M12 3.5L21.5 20h-19z')+P('M12 10v4')+P('M12 17h.01'),
 'status-down':   lambda e: frame(e)+P('M9 9l6 6M15 9l-6 6'),
 'status-info':   lambda e: frame(e)+P('M12 11v5')+P('M12 8h.01'),
 'status-unknown':lambda e: frame(e)+P('M9.75 9.5a2.25 2.25 0 1 1 3.2 2.05c-.6.3-.95.85-.95 1.5V14')+P('M12 17h.01'),
 'status-paused': lambda e: frame(e)+P('M10 9v6M14 9v6'),
 'status-maint':  lambda e: P('M14.5 4.5a4 4 0 0 0-4.9 5.3L4 15.4 8.6 20l5.6-5.6a4 4 0 0 0 5.3-4.9l-2.6 2.6-2.8-.6-.6-2.8z'),
 'link-external': lambda e: P('M14 4h6v6')+P('M20 4l-9 9')+(P('M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5') if e=='soft' else P('M18 14v6H4V6h6')),
 'link-internal': lambda e: P('M5 12h14')+P('M13 6l6 6-6 6'),
 'link':          lambda e: P('M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1')+P('M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1'),
 'copy':          lambda e: rr(8,8,12,12,2,e)+(P('M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3') if e=='soft' else P('M16 8V4H4v12h4')),
 'download':      lambda e: P('M12 4v11')+P('M7 10l5 5 5-5')+P('M5 20h14'),
 'upload':        lambda e: P('M12 15V4')+P('M7 9l5-5 5 5')+P('M5 20h14'),
 'server':        lambda e: rr(3,4,18,7,1.5,e)+rr(3,13,18,7,1.5,e)+P('M7 7.5h.01M7 16.5h.01'),
 'database':      lambda e: '<ellipse cx="12" cy="6" rx="8" ry="3"/>'+P('M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6')+P('M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3'),
 'folder':        lambda e: P('M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z') if e=='soft' else P('M3 5h6l2 2h10v12H3z'),
 'file':          lambda e: (P('M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z') if e=='soft' else P('M14 3H5v18h14V8z'))+P('M14 3v5h5'),
 'network':       lambda e: rr(9,3,6,5,1.5,e)+rr(3,16,6,5,1.5,e)+rr(15,16,6,5,1.5,e)+P('M12 8v4M6 16v-4h12v4'),
 'cloud':         lambda e: P('M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z'),
 'lock':          lambda e: rr(5,11,14,10,2,e)+P('M8 11V8a4 4 0 0 1 8 0v3'),
 'unlock':        lambda e: rr(5,11,14,10,2,e)+P('M8 11V8a4 4 0 0 1 7.75-1.4'),
 'key':           lambda e: '<circle cx="8" cy="15" r="4"/>'+P('M11 12l9-9M17 6l2 2M15 8l2 2'),
 'terminal':      lambda e: rr(3,4,18,16,2,e)+P('M7 9l3 3-3 3')+P('M13 15h4'),
 'search':        lambda e: '<circle cx="11" cy="11" r="6.5"/>'+P('M16 16l4.5 4.5'),
 'plus':          lambda e: P('M12 5v14M5 12h14'),
 'close':         lambda e: P('M6 6l12 12M18 6L6 18'),
 'check':         lambda e: P('M5 12.5l4.5 4.5L19 7'),
 'refresh':       lambda e: P('M20 12a8 8 0 1 1-2.34-5.66')+P('M20 4v4h-4'),
 'settings':      lambda e: P('M4 7h10M18 7h2M4 17h4M12 17h8')+('<circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>' if e=='soft' else '<rect x="14" y="5" width="4" height="4"/><rect x="8" y="15" width="4" height="4"/>'),
 'chevron-right': lambda e: P('M9 6l6 6-6 6'),
 'chevron-down':  lambda e: P('M6 9l6 6 6-6'),
 'clock':         lambda e: frame(e)+P('M12 7v5l3 2'),
 'trash':         lambda e: P('M4 7h16')+P('M10 11v6M14 11v6')+P('M6 7l1 13h10l1-13')+P('M9 7V4h6v3'),
 'power':         lambda e: P('M12 3v9')+P('M7 5.5a8 8 0 1 0 10 0'),
 'activity':      lambda e: P('M3 12h4l3-8 4 16 3-8h4'),
 'calendar':      lambda e: rr(4,5,16,15,2,e)+P('M4 10h16M9 3v4M15 3v4'),
 'eye':           lambda e: P('M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z')+'<circle cx="12" cy="12" r="3"/>',
 'eye-off':       lambda e: P('M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z')+'<circle cx="12" cy="12" r="3"/>'+P('M4 4l16 16'),
 'minus':         lambda e: P('M5 12h14'),
 'more':          lambda e: '<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="3"/>',
 'sort':          lambda e: P('M8 9l4-4 4 4')+P('M8 15l4 4 4-4'),
 'arrow-up':      lambda e: P('M12 19V5')+P('M6 11l6-6 6 6'),
 'arrow-down':    lambda e: P('M12 5v14')+P('M6 13l6 6 6-6'),
 'filter':        lambda e: P('M4 5h16l-6 7.5V19l-4 1.5v-8z'),
 'menu':          lambda e: P('M4 7h16M4 12h16M4 17h16'),
 'play':          lambda e: P('M8 5.5v13l10.5-6.5z'),
 'pause':         lambda e: P('M9 5v14M15 5v14'),
 'volume':        lambda e: P('M4 9.5h3.5L12 6v12l-4.5-3.5H4z')+P('M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10'),
 'volume-off':    lambda e: P('M4 9.5h3.5L12 6v12l-4.5-3.5H4z')+P('M16 9.5l5 5M21 9.5l-5 5'),
 'fullscreen':    lambda e: P('M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5'),
 'fullscreen-exit': lambda e: P('M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5'),
 'pip':           lambda e: rr(3,5,18,14,2,e)+rr(12,11,6,5,1,e),
 'captions':      lambda e: rr(3,5,18,14,2,e)+P('M10.5 10.3a2.2 2.2 0 1 0 0 3.4M16.5 10.3a2.2 2.2 0 1 0 0 3.4'),
 'skip-back':     lambda e: P('M11 7l-5 5 5 5M18 7l-5 5 5 5'),
 'skip-forward':  lambda e: P('M13 7l5 5-5 5M6 7l5 5-5 5'),
 'sun':           lambda e: '<circle cx="12" cy="12" r="4"/>'+P('M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'),
 'moon':          lambda e: P('M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'),
 'monitor':       lambda e: rr(3,4,18,12,2,e)+P('M8 20h8M12 16v4'),
 'image':         lambda e: rr(3,4,18,16,2,e)+'<circle cx="9" cy="10" r="2"/>'+P('M21 16l-5-5-9 9'),
 'zoom-in':       lambda e: '<circle cx="11" cy="11" r="6.5"/>'+P('M16 16l4.5 4.5M8 11h6M11 8v6'),
 'zoom-out':      lambda e: '<circle cx="11" cy="11" r="6.5"/>'+P('M16 16l4.5 4.5M8 11h6'),
 'user':          lambda e: '<circle cx="12" cy="8" r="4"/>'+P('M4 21a8 8 0 0 1 16 0'),
 'home':          lambda e: P('M4 11l8-7 8 7v9H4z')+P('M10 20v-6h4v6'),
 'qr':            lambda e: rr(3,3,7,7,1,e)+rr(14,3,7,7,1,e)+rr(3,14,7,7,1,e)+P('M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3'),
 'bell':          lambda e: (P('M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z') if e=='soft' else P('M6 16V9h12v7l2 2H4z'))+P('M10 20.5h4'),
 'inbox':         lambda e: (rr(3,4,18,16,2,e))+P('M3 13h5l1.5 2.5h5L16 13h5'),
 'grip':          lambda e: P('M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01'),
 'keyboard':      lambda e: rr(2.5,6,19,12,2,e)+P('M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6.5 14h.01M17.5 14h.01M9.5 14h5'),
 'shield':        lambda e: (P('M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z') if e=='soft' else P('M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z'))+P('M9 12l2 2 4-4'),
 'printer':       lambda e: P('M7 9V3h10v6')+rr(3,9,18,8,2,e)+P('M7 14h10v7H7z'),
 'grid':          lambda e: rr(4,4,7,7,1,e)+rr(13,4,7,7,1,e)+rr(4,13,7,7,1,e)+rr(13,13,7,7,1,e),
 'list':          lambda e: P('M9 6h11M9 12h11M9 18h11')+P('M4.5 6h.01M4.5 12h.01M4.5 18h.01'),
 'wrap':          lambda e: P('M4 6h16M4 12h13a3 3 0 0 1 0 6h-4')+P('M15 16l-2 2 2 2')+P('M4 18h5'),
 'diff':          lambda e: P('M12 4v8M8 8h8')+P('M8 18h8')+rr(4,2.5,16,19,2,e),
 'cpu':           lambda e: rr(6,6,12,12,1.5,e)+rr(9.5,9.5,5,5,0.5,e)+P('M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3'),
 'chart':         lambda e: P('M4 4v16h16')+P('M8 16v-4M12 16V8M16 16v-6'),
}
def svg(name,e,ink='#17150f'):
    cap,join=('round','round') if e=='soft' else ('square','miter')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" '
            f'stroke="{ink}" stroke-width="1.75" stroke-linecap="{cap}" stroke-linejoin="{join}">{I[name](e)}</svg>')
css=[]
for e in ('soft','hard'):
    d=f'{OUT}/{e}'; os.makedirs(d,exist_ok=True)
    for n in I:
        open(f'{d}/{n}.svg','w').write(svg(n,e))
for e,sel in (('soft',':root, [data-edge="soft"]'),('hard','[data-edge="hard"]')):
    lines=[]
    for n in I:
        s=svg(n,e,'#000').replace('"',"'")
        s=s.replace('%','%25').replace('#','%23').replace('<','%3C').replace('>','%3E')
        lines.append(f'  --pb-ic-{n}: url("data:image/svg+xml,{s}");')
    css.append(sel+' {\n'+'\n'.join(lines)+'\n}')
css.append('\n'.join(f'.pb-icon--{n} {{ --pb-ic: var(--pb-ic-{n}); }}' for n in I))
open('/home/claude/gen/icons.css','w').write('\n'.join(css)+'\n')
json.dump(list(I),open('/home/claude/gen/icons.json','w'))
print(len(I), os.path.getsize('/home/claude/gen/icons.css'))
