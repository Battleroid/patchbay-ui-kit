import os as _os
ROOT=(_os.environ.get('PB_WORK') or _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))).replace(_os.sep,'/')
g=ROOT+"/gen/"
b=open(g+"base.css").read(); m=open(g+"media.css").read(); c=open(g+"controls.css").read(); v=open(g+"viz.css").read()+"\n\n"+open(g+"cal.css").read()+"\n\n"+open(g+"forms2.css").read()+"\n\n"+open(g+"overlay.css").read()+"\n\n"+open(g+"player.css").read()+"\n\n"+open(g+"shell.css").read()+"\n\n"+open(g+"tier2.css").read()+"\n\n"+open(g+"homelab.css").read()+"\n\n"+(open(g+"extra.css").read() if __import__("os").path.exists(g+"extra.css") else "")+"\n\n"+(open(g+"more.css").read() if __import__("os").path.exists(g+"more.css") else "")+"\n\n"+(open(g+"app.css").read() if __import__("os").path.exists(g+"app.css") else ""); i=open(g+"icons.css").read()
b=b.replace("/* ---------- Reduced motion ---------- */", m.strip()+"\n\n"+c.strip()+"\n\n"+v.strip()+"\n\n/* ---------- Reduced motion ---------- */")
b=b.replace("  .pb-spin { animation: none; }","  .pb-spin, .pb-progressbar:indeterminate { animation: none; }\n  .pb-check::before, .pb-radio::before, .pb-switch::before, .pb-details > summary::before { transition: none; }\n  .pb-card--outline { transition: none; }")
open(ROOT+"/ds/project/components/bundle.css","w").write(b+i)
