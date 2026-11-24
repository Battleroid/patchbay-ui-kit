import json,re,os,html
T=json.load(open('/home/claude/ds/project/tokens.json'))
ICONS=json.load(open('icons.json'))
PV='pv'; C='/home/claude/ds/project/components'
# tokens css with relative fonts
import sys; sys.path.insert(0,'/home/claude/gen'); from tokcss_lib import tokens_css
tok=[tokens_css(T,lambda f:'fonts/'+os.path.basename(f))]
bundle=open(f'{C}/bundle.css').read()
colors={k['name']:k for k in T['color']['tokens']}
def resolve(v,t='light'):
    while True:
        if isinstance(v,dict): v=v.get(t,v.get('light'))
        if isinstance(v,str) and v.startswith('{'): v=colors[v[1:-1]]['value']; continue
        return v
def first_sentence(n):
    s=open(f'{C}/{n}/README.md').read().strip().split('\n')[0]
    return html.escape(s.split('. ')[0].rstrip('.')+'.').replace('`','')
def frag(n):
    b=open(f'{PV}/{n}.html').read().strip().replace('{{SAMPLE}}','media/sample.mp4').replace('{{POSTER}}','media/poster.jpg')+''
    for i in range(1,7): b=b.replace('{{PHOTO%d}}'%i,'media/photo-%d.jpg'%i).replace('{{THUMB%d}}'%i,'media/thumb-%d.jpg'%i)
    b=b
    js=open(f'{PV}/{n}.js').read().strip() if os.path.exists(f'{PV}/{n}.js') else ''
    return b,js
SECTIONS=[
 ('helpers','Theme and text',['ThemeSwitch','Density','TextUtils','Scrollbars','AppIcons']),
 ('actions','Actions',['Button','ButtonGroup','Segmented','Menu','Link','CommandPalette','ContextMenu','BulkActions','Shortcuts','ConfirmAction','ShareLink']),
 ('forms','Forms',['TextInput','InputTypes','Select','Combobox','TagInput','DatePicker','TimePicker','ColorPicker','CodeInput','CopyField','Checkbox','Radio','Switch','ChoiceCard','Range','DualRange','KeyValue','Fieldset','ErrorSummary','QueryFilter','MarkdownEditor','NotifySettings','CodeArea','DropZone','AutoSubmit']),
 ('indicators','Indicators',['Badge','Pill','Notice','Toast','Notifications','Progress','Loading','Tooltip','Popover','Avatar','SiteBanner','UploadQueue','BusyRegion','StorageRing']),
 ('data','Data',['Chart','ChartGround','Sparkline','StatTile','DataTable','DetailList','TreeView','Timeline','TableTools','Diagram','Flow','TimeRange','Heatmap','Gauge','BarChart','Histogram','JsonViewer','EventCalendar','VirtualList','QRCode']),
 ('layout','Layout',['Card','ListItem','Tabs','Disclosure','Breadcrumbs','Steps','Pagination','EmptyState','Resizable','Sortable','CommentThread','MobileNav','SessionTimeout','Dialog','ImageViewer','MediaPlayer','Media','MediaList','Prose','SkipLink','MediaState','CompactVariants']),
 ('homelab','Homelab',['LogViewer','LogExplorer','ShareDialog','FilePreview','Terminal','DiffViewer','FileBrowser','CronBuilder','StorageBar','Rack']),
 ('pages','Pages',['SiteHeader','AppShell','Dashboard','SettingsPage','SignIn','ApiTokens','PrintReport','AlertEmail','StatusPage']),
]
NAMES={'ButtonGroup':'Button group','TextInput':'Text input','InputTypes':'Input types','CodeArea':'Code area','DropZone':'Drop zone','DataTable':'Data table','StatusPage':'Status page','ChartGround':'Chart grounds','DatePicker':'Date picker','MediaPlayer':'Media player','StatTile':'Stat tile','ThemeSwitch':'Theme switch','TextUtils':'Text helpers','CommandPalette':'Command palette','ContextMenu':'Context menu','ErrorSummary':'Error summary','SiteBanner':'Site banner','DetailList':'Detail list','TreeView':'Tree view','QRCode':'QR code','ListItem':'List item','EmptyState':'Empty and result states','ImageViewer':'Image viewer','SkipLink':'Skip link','AppShell':'App shell','Resizable':'Resizable panels','BulkActions':'Bulk actions','QueryFilter':'Query filter','UploadQueue':'Upload queue','JsonViewer':'JSON viewer','VirtualList':'Virtual list','LogViewer':'Log viewer','LogExplorer':'Log explorer','TimeRange':'Time range and charts','MediaList':'Media list','SiteHeader':'Site header','ShareDialog':'Share dialog','FilePreview':'File preview','TableTools':'Table tools','EventCalendar':'Event calendar','MarkdownEditor':'Markdown editor','CommentThread':'Comment thread','NotifySettings':'Notification settings','MobileNav':'Phone navigation','SessionTimeout':'Session timeout','AppIcons':'App icons','AlertEmail':'Alert email','DiffViewer':'Diff viewer','FileBrowser':'File browser','CronBuilder':'Cron builder','StorageBar':'Storage bar','BarChart':'Bar chart','SettingsPage':'Settings page','SignIn':'Sign-in and two-factor','ApiTokens':'API tokens','PrintReport':'Print and reports','Gauge':'Gauges and donuts','Heatmap':'Calendar heatmap'}
scripts=[]
import pbscripts as S
AGO="document.querySelectorAll('time[data-ago]').forEach(function(t){t.setAttribute('datetime',new Date(Date.now()-t.dataset.ago*1000).toISOString());});"
def spec(n):
    b,_=frag(n)
    # The page carries the whole bundle once and calls pbInit() at the end; each component adds only its example glue.
    js=S.page_glue(n).replace(AGO,'').strip() if n in S.COMPONENTS else ''
    if js: scripts.append(f'(function(){{\n{js}\n}})();')
    wide=' spec--wide' if n in ('DataTable','StatusPage','Media','Diagram','InputTypes','StatTile','Flow','ChartGround','AppShell','SiteBanner','Resizable','ImageViewer','EmptyState','LogViewer','LogExplorer','DiffViewer','FileBrowser','Terminal','Heatmap','BarChart','JsonViewer','BulkActions','QueryFilter','VirtualList','Dashboard','SettingsPage','SignIn','ApiTokens','PrintReport','Rack','Gauge','MediaList','DropZone','TimeRange','SiteHeader','FilePreview','TableTools','EventCalendar','MarkdownEditor','NotifySettings','AlertEmail','AppIcons','Density') else ''
    return f'<section class="spec{wide}" id="c-{n.lower()}"><header class="spec__meta"><h3 class="spec__name">{NAMES.get(n,n)}</h3><p class="spec__note">{first_sentence(n)}</p></header><div class="spec__demo">{b}</div></section>'
# foundations
groups=[('Surfaces and text',['bg','surface','surface-sunk','code-bg','line','line-strong','ink','ink-muted']),
 ('Accent and pop',['accent','accent-hover','accent-tint','on-accent','pop-yellow','pop-mint','pop-red','on-pop','mark']),
 ('Status',['ok','ok-tint','warn','warn-tint','down','down-tint','info','info-tint','unknown']),
 ('Syntax',['syn-keyword','syn-string','syn-number','syn-function','syn-type','syn-comment']),
 ('Charts',['chart-1','chart-2','chart-3','chart-4','chart-grid','on-ink-muted','ink-line','ink-band'])]
sw=''
for g,names in groups:
    cells=''
    for n in names:
        k=colors[n]; v=k['value']; alias=v if isinstance(v,str) and v.startswith('{') else ''
        cells+=f'<div class="sw"><span class="sw__chip" style="background:var(--{n})"></span><span class="sw__name">{n}</span><span class="sw__val">{resolve(v)}{" / "+resolve(v,"dark") if resolve(v,"dark")!=resolve(v) else ""}{" · "+alias.strip("{}") if alias else ""}</span><span class="sw__use">{html.escape(k["usage"])}</span></div>'
    sw+=f'<div class="fgroup"><h4 class="fgroup__t">{g}</h4><div class="swgrid">{cells}</div></div>'
types=''
for g in T['type']['groups']:
    for s in g['styles']:
        st=f'font-family:var(--font-{s.get("family",g["family"])});font-size:{s["fontSize"]};line-height:{s["lineHeight"]};font-weight:{s["fontWeight"]};'
        if s.get('letterSpacing'): st+=f'letter-spacing:{s["letterSpacing"]};'
        if s.get('fontStyle'): st+=f'font-style:{s["fontStyle"]};'
        if s['name']=='label': st+='text-transform:uppercase;'
        meta=f'{g["family"]} · {s["fontSize"]}/{s["lineHeight"]} · {s["fontWeight"]}'
        types+=f'<div class="ty"><div class="ty__meta"><span class="sw__name">{s["name"]}</span><span class="sw__val">{meta}</span></div><div class="ty__sample" style="{st}">{html.escape(s["sample"])}</div></div>'
spacing=''.join(f'<div class="sp"><span class="sw__name">{k["name"]}</span><span class="sp__bar" style="width:var(--{k["name"]})"></span><span class="sw__val">{k["value"]}</span></div>' for k in T['spacing']['tokens'])
shapes=''.join(f'<div class="shp"><div class="shp__box" style="border-radius:var(--pb-r-{r});box-shadow:var(--pb-shadow-{s})"></div><span class="sw__name">r-{r} · shadow-{s}</span></div>' for r,s in [('sm','sm'),('md','sm'),('lg','md'),('pill','lg')])
icons=''.join(f'<figure class="ic"><span class="pb-icon pb-icon--{n} pb-icon--24"></span><figcaption>{n}</figcaption></figure>' for n in ICONS)
found=f'''<section class="spec spec--wide" id="c-color"><header class="spec__meta"><h3 class="spec__name">Color</h3><p class="spec__note">Light and dark themes; each swatch shows both. Accent is the only interactive color; pops carry color; status colors mean state only.</p></header><div class="spec__demo">{sw}</div></section>
<section class="spec spec--wide" id="c-type"><header class="spec__meta"><h3 class="spec__name">Type</h3><p class="spec__note">Source Serif 4 for reading, Obel Mono for anything a machine would print.</p></header><div class="spec__demo"><div class="tylist">{types}</div></div></section>
<section class="spec" id="c-space"><header class="spec__meta"><h3 class="spec__name">Spacing</h3><p class="spec__note">A 4px grid.</p></header><div class="spec__demo"><div class="splist">{spacing}</div></div></section>
<section class="spec" id="c-shape"><header class="spec__meta"><h3 class="spec__name">Shape and depth</h3><p class="spec__note">Radius and shadow follow the edge switch: diffuse and rounded, or square with offset shadows.</p></header><div class="spec__demo"><div class="shplist">{shapes}</div></div></section>
<section class="spec spec--wide" id="c-icons"><header class="spec__meta"><h3 class="spec__name">Icons</h3><p class="spec__note">{len(ICONS)} stroke icons in two cuts that follow the edge switch. They paint in the current text color.</p></header><div class="spec__demo"><div class="icgrid">{icons}</div></div></section>'''
nav=[('foundations','Foundations')]+[(a,b) for a,b,_ in SECTIONS]
body=f'<section class="band" id="foundations"><h2 class="band__t">Foundations</h2>{found}</section>'
for sid,title,comps in SECTIONS:
    body+=f'<section class="band" id="{sid}"><h2 class="band__t">{title}</h2>'+''.join(spec(n) for n in comps)+'</section>'
total=sum(len(c) for _,_,c in SECTIONS)
hero='''<div class="hero__sample">
  <div class="pb-card">
    <div class="pb-card__band pb-card__band--mint"><span class="pb-icon pb-icon--status-ok pb-icon--16"></span>All systems normal</div>
    <div class="pb-card__head"><h3 class="pb-card__title">nas-01</h3><span class="pb-badge" data-status="ok"><span class="pb-icon"></span>up</span></div>
    <div class="hero__stats">
      <div class="pb-stat"><span class="pb-eyebrow">uptime · 30d</span><span class="pb-stat__value">99.98<small>%</small></span></div>
      <div class="pb-stat"><span class="pb-eyebrow">tank used</span><span class="pb-stat__value">6.2<small>TB</small></span><meter class="pb-meterbar" min="0" max="100" low="70" high="90" optimum="10" value="78"></meter></div>
    </div>
    <label class="pb-choice" style="justify-content:space-between;margin:20px 0"><span>Expose to internet</span><input type="checkbox" role="switch" class="pb-switch" checked></label>
    <div class="pb-toolbar"><button class="pb-btn pb-btn--primary"><span class="pb-icon pb-icon--refresh"></span>Restart</button><button class="pb-btn"><span class="pb-icon pb-icon--terminal"></span>Logs</button><span class="pb-toolbar__spacer"></span><span class="pb-pill pb-pill--yellow">beta</span></div>
  </div>
</div>'''
page=f'''<!DOCTYPE html>
<html lang="en" data-edge="soft">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="pb-theme-boot.js"></script>
<title>Patchbay kit</title>
<style>
/* VOICE: calm documentation site, like a well-kept personal blog
   IDEA: a specimen book: every part of the kit, live, beside one line on when to use it
   PICTURE: a live service card built from the kit, re-cut by the edge switch
   COLOUR and TYPE: the kit's own tokens; Source Serif 4 and Obel Mono
   LAYOUT: name and switch, sticky section links, then name-left / demo-right specimens */
{chr(10).join(tok)}
{bundle}
*{{box-sizing:border-box;min-width:0}}
html{{scroll-padding-top:72px;background:var(--bg)}}
body{{margin:0;background:var(--bg);color:var(--ink);overflow-x:clip}}
.wrap{{max-width:1240px;margin:0 auto;padding:0 max(4vw,16px)}}
.hero{{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:center;padding:56px 0 40px}}
.hero__name{{margin:0;font:600 clamp(52px,8vw,96px)/0.95 var(--font-serif);letter-spacing:-0.02em;text-wrap:balance}}
.hero__lede{{margin:16px 0 28px;max-width:34em;font:400 19px/29px var(--font-serif);color:var(--ink-muted)}}
.hero__switch{{display:flex;flex-wrap:wrap;align-items:center;gap:12px}}
.hero__stats{{display:grid;grid-template-columns:1fr 1fr;gap:24px}}
.hero__count{{margin-top:20px;font:400 13px/18px var(--font-mono);color:var(--ink-muted)}}
.nav{{position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:1px solid var(--line)}}
[data-edge=hard] .nav{{border-bottom-color:var(--ink)}}
.nav__in{{display:flex;gap:4px;align-items:center;overflow-x:auto}}
.nav a{{flex:none;display:inline-flex;align-items:center;height:48px;padding:0 12px;font:500 13px/16px var(--font-mono);color:var(--ink-muted);text-decoration:none;border-bottom:2px solid transparent}}
.nav a:hover{{color:var(--ink)}}
.nav a[aria-current=true]{{color:var(--ink);border-bottom-color:var(--accent)}}
.nav__theme{{margin-left:auto;flex:none}}
.nav__edge{{flex:none}}
.band{{padding:48px 0 16px}}
.band__t{{margin:0 0 8px;font:600 32px/38px var(--font-serif);letter-spacing:-0.01em}}
.spec{{display:grid;grid-template-columns:220px minmax(0,1fr);gap:24px 40px;padding:32px 0;border-top:1px solid var(--line)}}
.band__t+.spec{{border-top:0}}
.spec__meta{{position:sticky;top:72px;align-self:start}}
.spec__name{{margin:0 0 6px;font:600 19px/26px var(--font-serif)}}
.spec__note{{margin:0;font:400 15px/23px var(--font-serif);color:var(--ink-muted)}}
.spec__demo{{max-width:640px}}
.spec--wide .spec__demo{{max-width:none}}
.fgroup+.fgroup{{margin-top:28px}}
.fgroup__t{{margin:0 0 12px;font:600 15px/20px var(--font-serif)}}
.swgrid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}}
.sw{{display:grid;gap:2px;align-content:start}}
.sw__chip{{height:56px;margin-bottom:8px;border-radius:var(--pb-r-md);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ink) 18%,transparent)}}
[data-edge=hard] .sw__chip{{box-shadow:inset 0 0 0 1px var(--ink)}}
.sw__name{{font:600 12px/16px var(--font-mono)}}
.sw__val{{font:400 12px/16px var(--font-mono);color:var(--ink-muted)}}
.sw__use{{font:400 14px/20px var(--font-serif);color:var(--ink-muted);margin-top:2px}}
.tylist{{display:grid}}
.ty{{display:grid;grid-template-columns:200px minmax(0,1fr);gap:16px;align-items:baseline;padding:14px 0;border-bottom:1px solid var(--line)}}
.ty__meta{{display:grid;gap:2px}}
.ty__sample{{overflow-wrap:anywhere}}
.splist,.shplist{{display:grid;gap:10px}}
.sp{{display:grid;grid-template-columns:90px auto 1fr;gap:16px;align-items:center}}
.sp__bar{{height:16px;background:var(--accent);border-radius:2px}}
.shplist{{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:24px}}
.shp{{display:grid;gap:12px}}
.shp__box{{height:72px;background:var(--surface);border:1px solid var(--pb-border)}}
.icgrid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:4px}}
.ic{{margin:0;display:grid;justify-items:center;gap:8px;padding:14px 4px;border-radius:var(--pb-r-md)}}
.ic:hover{{background:var(--surface-sunk)}}
.ic figcaption{{font:400 11px/14px var(--font-mono);color:var(--ink-muted);text-align:center;overflow-wrap:anywhere}}
.spec__demo .pb-chart:not([data-g]){{max-width:460px}}
.dscroll{{overflow-x:auto}}.dscroll>.pb-diagram{{min-width:560px}}
.foot{{padding:40px 0 64px;border-top:1px solid var(--line);font:400 13px/18px var(--font-mono);color:var(--ink-muted)}}
@media (max-width:900px){{
  .hero{{grid-template-columns:minmax(0,1fr);gap:32px;padding-top:40px}}
  .spec{{grid-template-columns:minmax(0,1fr);gap:16px}}
  .spec__meta{{position:static}}
  .nav__edge{{display:none}}
}}
@media (max-width:640px){{
  .spec__demo [style*="grid-template-columns:1fr 1fr"],.spec__demo [style*="repeat(3,1fr)"],.hero__stats{{grid-template-columns:minmax(0,1fr)!important}}
  .spec__demo .pb-media{{grid-column:auto!important}}
  .ty{{grid-template-columns:minmax(0,1fr);gap:4px}}
  .pb-media__frame--file{{grid-template-columns:auto 1fr}}
  .pb-media__frame--file>.pb-btn{{grid-column:1/-1}}
}}
</style>
</head>
<body class="pb">
<div class="wrap">
  <header class="hero">
    <div>
      <h1 class="hero__name">Patchbay</h1>
      <p class="hero__lede">The parts for a family of homelab apps: a comfortable serif for reading, Obel Mono for hosts, numbers and controls, warm paper and a few loud colors. Every part comes in two cuts.</p>
      <div class="hero__switch">
        <div class="pb-seg" role="radiogroup" aria-label="Edges" data-edge-switch>
          <label><input type="radio" name="edge-hero" value="soft" checked>Soft edges</label><label><input type="radio" name="edge-hero" value="hard">Hard edges</label>
        </div>
      </div>
      <div class="hero__count">{total} components · {len(ICONS)} icons · {len(T["color"]["tokens"])} color tokens · {sum(len(g["styles"]) for g in T["type"]["groups"])} type styles</div>
    </div>
    {hero}
  </header>
</div>
<nav class="nav" aria-label="Sections"><div class="wrap nav__in">
  {''.join(f'<a href="#{a}">{b}</a>' for a,b in nav)}
  <div class="pb-seg pb-seg--sm pb-seg--icon nav__theme pb-themeswitch" role="radiogroup" aria-label="Theme" data-theme-switch><label title="Light"><input type="radio" name="theme-nav" value="light" aria-label="Light"><span class="pb-icon pb-icon--sun"></span></label><label title="Dark"><input type="radio" name="theme-nav" value="dark" aria-label="Dark"><span class="pb-icon pb-icon--moon"></span></label><label title="System"><input type="radio" name="theme-nav" value="system" aria-label="System"><span class="pb-icon pb-icon--monitor"></span></label></div>
  <div class="pb-seg pb-seg--sm nav__edge" role="radiogroup" aria-label="Edges" data-edge-switch><label><input type="radio" name="edge-nav" value="soft" checked>soft</label><label><input type="radio" name="edge-nav" value="hard">hard</label></div>
</div></nav>
<main class="wrap">
{body}
</main>
<footer class="wrap foot">Patchbay · sample content is made up · built from the Patchbay design system</footer>
<script>
{{
const root=document.documentElement;
function setEdge(v){{root.dataset.edge=v;document.querySelectorAll('[data-edge-switch] input').forEach(i=>{{i.checked=i.value===v}});try{{localStorage.setItem('pb-edge',v)}}catch(e){{}}dispatchEvent(new Event('resize'));}}
document.querySelectorAll('[data-edge-switch] input').forEach(i=>i.addEventListener('change',()=>setEdge(i.value)));
let saved=null;try{{saved=localStorage.getItem('pb-edge')}}catch(e){{}}
if(saved==='hard')setEdge('hard');
const links=[...document.querySelectorAll('.nav a')];
const io=new IntersectionObserver(es=>{{es.forEach(e=>{{if(e.isIntersecting)links.forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+e.target.id))}})}},{{rootMargin:'-40% 0px -55% 0px'}});
document.querySelectorAll('main>.band').forEach(s=>io.observe(s));
document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{{if(f.method==='dialog'||(e.submitter&&e.submitter.formMethod==='dialog'))return;e.preventDefault();}}));
document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
}}
{S.bundle()}
{AGO}
{chr(10).join(scripts)}
pbInit();
</script>
</body>
</html>'''
# wrap diagram for narrow scroll
page=page.replace('<div class="pb-diagram"','<div class="dscroll"><div class="pb-diagram"',1)
i=page.index('<div class="dscroll">'); j=page.index('</div></section>',i)
page=page[:j]+'</div>'+page[j:]
open('/home/claude/kit/index.html','w').write(page)
print(len(page))
