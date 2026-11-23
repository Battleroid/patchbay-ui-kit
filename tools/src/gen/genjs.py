PV='/home/claude/gen/pv/'
libs=[open(PV+'_pickers.js').read(),open(PV+'_overlay.js').read(),open(PV+'_player.js').read(),open(PV+'_qr.js').read(),open(PV+'_ui.js').read(),open(PV+'_hl.js').read(),open(PV+'_viz2.js').read(),open(PV+'_ix.js').read(),open(PV+'_ts.js').read(),open(PV+'_dt.js').read(),open(PV+'_misc.js').read()]
defs=[l.strip() for l in libs]; inits=[]
SKIP=('data-inline-cal','data-inline-clock','data-long','data-demo','data-toast','WEBVTT','.ph')
for n in ['DatePicker','TimePicker','Combobox','TagInput','CodeInput','ColorPicker','CopyField','KeyValue','DualRange','Button','TextInput','InputTypes','Range','Tabs','Fieldset','Menu','Dialog','Notifications','DataTable','MediaPlayer']:
    src=open(PV+n+'.js').read()
    for l in libs: src=src.replace(l,'')
    stmts=[];cur=[]
    for line in src.splitlines():
        if line and not line[0].isspace() and cur: stmts.append('\n'.join(cur)); cur=[]
        if line.strip(): cur.append(line)
    if cur: stmts.append('\n'.join(cur))
    for st in stmts:
        if st.startswith('document.querySelectorAll'):
            if any(s in st for s in SKIP): continue
            inits.append(f'  /* {n} */\n  '+st.replace('document.querySelectorAll','root.querySelectorAll').replace('\n','\n  '))
        elif st.startswith('/*'): continue
        else: defs.append(st)
seen=[]
for d in defs:
    if d not in seen: seen.append(d)
EXTRA='''  /* Shell, theme, popovers, tree, command palette, context menus, gallery, avatars, pager, validation, text, QR, split */
  root.querySelectorAll('[data-shell]').forEach(pbShell);
  root.querySelectorAll('[data-sitehead]').forEach(pbSiteHead);
  root.querySelectorAll('[data-trange]').forEach(pbTimeRange);
  root.querySelectorAll('[data-refresh]').forEach(pbRefresh);
  root.querySelectorAll('[data-ts]').forEach(pbTimeSeries);
  root.querySelectorAll('[data-share]').forEach(pbShare);
  root.querySelectorAll('[data-fpreview]').forEach(pbFilePreview);
  root.querySelectorAll('[data-dt]').forEach(pbDataTable);
  root.querySelectorAll('[data-evcal]').forEach(pbEventCal);
  root.querySelectorAll('[data-md]').forEach(pbMdEditor);
  root.querySelectorAll('[data-thread]').forEach(pbThread);
  root.querySelectorAll('[data-notify]').forEach(pbNotify);
  root.querySelectorAll('[data-dropset]').forEach(pbDropSet);
  root.querySelectorAll('dialog.pb-sheet').forEach(pbSheet);
  root.querySelectorAll('dialog.pb-session').forEach(function(d){if(!d.hasAttribute('open'))pbSession(d);});
  root.querySelectorAll('[data-theme-switch]').forEach(pbThemeSwitch);
  pbPopovers(root);
  root.querySelectorAll('[data-tree]').forEach(pbTree);
  root.querySelectorAll('dialog.pb-cmd').forEach(pbCommand);
  root.querySelectorAll('[data-contextmenu]').forEach(pbContext);
  root.querySelectorAll('[data-lightbox]').forEach(pbLightbox);
  root.querySelectorAll('[data-avatar]').forEach(pbAvatar);
  root.querySelectorAll('[data-pager]').forEach(pbPager);
  root.querySelectorAll('form[data-validate]').forEach(pbValidate);
  pbRelTime(root);
  root.querySelectorAll('[data-midtrunc]').forEach(pbMidTrunc);
  root.querySelectorAll('.pb-more[aria-controls]').forEach(pbClampToggle);
  root.querySelectorAll('[data-qr]').forEach(pbQRCode);
  root.querySelectorAll('[data-split]').forEach(pbSplit);
  root.querySelectorAll('[data-log]').forEach(pbLog);
  root.querySelectorAll('[data-logx]').forEach(pbLogX);
  root.querySelectorAll('[data-diff]').forEach(pbDiff);
  root.querySelectorAll('[data-files]').forEach(pbFiles);
  root.querySelectorAll('[data-term]').forEach(pbTerm);
  root.querySelectorAll('[data-cron-builder]').forEach(pbCron);
  root.querySelectorAll('[data-storage]').forEach(pbStorage);
  root.querySelectorAll('[data-rack]').forEach(pbRack);
  root.querySelectorAll('[data-heat]').forEach(pbHeat);
  root.querySelectorAll('[data-dial]').forEach(pbDial);
  root.querySelectorAll('[data-donut]').forEach(pbDonut);
  root.querySelectorAll('[data-bars]').forEach(pbBars);
  root.querySelectorAll('[data-hist]').forEach(pbHist);
  root.querySelectorAll('[data-json]').forEach(pbJSON);
  root.querySelectorAll('[data-bulk]').forEach(pbBulk);
  root.querySelectorAll('[data-qf]').forEach(pbQuery);
  root.querySelectorAll('[data-sortable]').forEach(pbSortable);
  root.querySelectorAll('dialog.pb-keys').forEach(pbShortcuts);
  root.querySelectorAll('[data-upq]').forEach(pbUploadQueue);
  root.querySelectorAll('[data-section-nav]').forEach(pbSectionNav);
  root.querySelectorAll('[data-dismiss]').forEach(function(b){b.addEventListener('click',function(){var s=b.closest('.pb-sitebar,.pb-notice,.pb-toast');if(s)s.remove();});});'''
inits.append(EXTRA)
open('/home/claude/gen/patchbay.js','w').write('/* Patchbay behaviors. Load after the markup and call pbInit() once (or pbInit(container) for markup added later).\n   Also exposes pbConfirm(), pbToast(), pbCalendar(), pbClock(), pbTheme(), pbQRSvg(), pbPlace(), pbVirtual(), pbAnsi() and pbCronParse() for use from app code. */\n'+'\n'.join(seen)+'\nfunction pbInit(root){\n  root=root||document;\n'+'\n'.join(inits)+'\n}\n')
