/* App patterns: pieces apps kept rebuilding (notices, confirms, autosubmit, busy regions, share links, storage ring, media state and teasers,
   shortcut registry). Loaded last, after _forms.js. All CSS is in app.css. */
Object.assign(pbStrings,Object.assign({copyLink:'Copy link',open:'Open',qrCode:'QR code',ringLabel:'Storage {n}% used',busy:'Loading',processing:'processing',failed:'failed'},pbStrings));

/* ---------- Notice: pbNotice({variant, title, body | bodyHTML, actions, dismissible}) returns Notice markup.
   variant is info (default), ok, warn or down (down is announced as an alert); body is text (escaped), bodyHTML is markup you trust.
   actions: [{label, href?}] render as a button, or a link with href; wire a click handler with pbNoticeInto. ---------- */
function pbNotice(o){o=o||{};var v=o.variant||o.status||'info',b=o.bodyHTML!=null?o.bodyHTML:(o.body!=null&&o.body!==''?pbEsc(o.body&&o.body.nodeType?o.body.textContent:o.body):'');
  var acts=(o.actions||[]).map(function(a,i){return a.href!=null&&/^(https?:|mailto:|\/|#|\.\/|\.\.\/|\?)/i.test(a.href)?'<a class="pb-link" href="'+pbEsc(a.href)+'">'+pbEsc(a.label)+'</a>':'<button type="button" class="pb-btn pb-btn--sm'+(i?' pb-btn--ghost':'')+'" data-i="'+i+'">'+pbEsc(a.label)+'</button>';}).join('');
  return '<div class="pb-notice"'+(v!=='info'?' data-status="'+pbEsc(v)+'"':'')+' role="'+(v==='down'?'alert':'status')+'"><span class="pb-icon pb-icon--status-'+pbEsc(v)+'"></span>'+(o.title?'<p class="pb-notice__title">'+pbEsc(o.title)+'</p>':'')+
    (b?'<p class="pb-notice__body">'+b+'</p>':'')+(acts?'<div class="pb-notice__actions">'+acts+'</div>':'')+(o.dismissible?'<button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-x aria-label="'+pbEsc(pbStrings.dismiss)+'"><span class="pb-icon pb-icon--close"></span></button>':'')+'</div>';}
/* pbNoticeInto(container, opts): replaces the container's content with the notice (opts.append: add it after what is there) and returns the .pb-notice element.
   Also takes a Node as body, and an action's onClick(event, notice); dismissing removes it and moves focus to the container. */
function pbNoticeInto(c,o){o=o||{};var t=document.createElement('template');t.innerHTML=pbNotice(Object.assign({},o,o.body&&o.body.nodeType?{body:''}:{})).trim();var n=t.content.firstElementChild;
  if(o.body&&o.body.nodeType){var p=document.createElement('p');p.className='pb-notice__body';p.appendChild(o.body);var at=n.querySelector('.pb-notice__actions,[data-x]');n.insertBefore(p,at);}
  if(!o.append)c.replaceChildren();c.appendChild(n);
  n.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!n.contains(b))return;if(b.hasAttribute('data-x')){n.remove();if(c.isConnected){if(c.tabIndex<0&&!c.hasAttribute('tabindex'))c.tabIndex=-1;c.focus();}return;}
    var a=b.dataset.i!=null&&(o.actions||[])[+b.dataset.i];if(a&&a.onClick)a.onClick(e,n);});
  return n;}

/* ---------- Confirm hook: [data-confirm="Title"] on a button, submit button or link (or a form) asks first with pbConfirm, then does the click or submit for real,
   so the button's name and value, formaction, htmx attributes and a link's href all apply. Optional: data-confirm-body, data-confirm-ok (the action's label),
   data-confirm-cancel, data-confirm-variant="danger" (also the default on .pb-btn--danger), data-confirm-type="word" (type it to enable the button).
   Without script the control simply does its action, so confirm destructive actions on the server too, or render the control disabled
   with data-confirm-enable: nothing is sent unconfirmed without script, and the hook enables it once it is bound. ---------- */
function pbConfirmHook(el){var open=false,go=false;
  (el.tagName==='FORM'?[].slice.call(el.querySelectorAll('[data-confirm-enable]')):el.hasAttribute('data-confirm-enable')?[el]:[]).forEach(function(c){c.disabled=false;c.removeAttribute('aria-disabled');});
  function ask(){var d=el.dataset;return pbConfirm({title:d.confirm,body:d.confirmBody,confirm:d.confirmOk,cancel:d.confirmCancel,typeToConfirm:d.confirmType,danger:d.confirmVariant==='danger'||(d.confirmVariant==null&&el.matches('.pb-btn--danger,.pb-menu__item--danger'))});}
  if(el.tagName==='FORM'){el.addEventListener('submit',function(e){if(go){go=false;return;}e.preventDefault();e.stopImmediatePropagation();if(open)return;open=true;var s=e.submitter;
      ask().then(function(ok){open=false;if(!ok)return;go=true;try{el.requestSubmit(s);}catch(err){el.requestSubmit();}go=false;});},true);return;}
  el.addEventListener('click',function(e){if(go)return;e.preventDefault();e.stopImmediatePropagation();if(open||el.disabled||el.getAttribute('aria-disabled')==='true')return;open=true;
    ask().then(function(ok){open=false;if(!ok){if(el.isConnected)el.focus();return;}go=true;el.click();go=false;});},true);}

/* ---------- Autosubmit: form[data-autosubmit] submits on change of its controls (debounced; data-autosubmit="400" sets the ms, default 250), through requestSubmit
   so validation, submit handlers and htmx still run. Mark the submit button [data-autosubmit-button]: it stays visible without script and is hidden here.
   Say in the form's label or help that it applies as you change it (WCAG 3.2.2). ---------- */
function pbAutoSubmit(form){var ms=+form.getAttribute('data-autosubmit')||250,tm=0;
  form.querySelectorAll('[data-autosubmit-button]').forEach(function(b){b.hidden=true;});
  form.addEventListener('change',function(e){var t=e.target;if(!t.form&&t.closest('form')!==form)return;if(t.type==='file'||t.hasAttribute('data-autosubmit-skip'))return;clearTimeout(tm);tm=setTimeout(function(){if(form.isConnected)form.requestSubmit();},ms);});
  form.addEventListener('submit',function(){clearTimeout(tm);});}

/* ---------- Busy regions: [aria-busy="true"] dims its content, blocks the pointer and shows a spinner after 300 ms (app.css), so quick swaps never flash.
   pbBusy(true, region) sets or clears aria-busy on a region (element or selector; a button also swaps to data-busy-label and ignores clicks while busy); pbBusy(true) with no region shows a top progress bar (counted: every on needs an off). ---------- */
var pbBusyN=0,pbBusyBar=null;
function pbBusy(on,target){if(typeof target==='string')target=document.querySelector(target);
  if(target){if(target.matches('button,[role=button]')){if(!target.__pbBusy){target.__pbBusy=true;target.addEventListener('click',function(e){if(target.getAttribute('aria-busy')==='true'){e.preventDefault();e.stopImmediatePropagation();}},true);}
      if(on&&target.getAttribute('aria-busy')!=='true'){target.__pbLabel=target.textContent;if(target.dataset.busyLabel){var l=[].filter.call(target.childNodes,function(n){return n.nodeType===3&&n.textContent.trim();}).pop();if(l){target.__pbText=l;target.__pbOld=l.textContent;l.textContent=target.dataset.busyLabel;}else target.textContent=target.dataset.busyLabel;}target.setAttribute('aria-disabled','true');}
      else if(!on&&target.getAttribute('aria-busy')==='true'){if(target.__pbText)target.__pbText.textContent=target.__pbOld;else if(target.dataset.busyLabel)target.textContent=target.__pbLabel;target.__pbText=null;target.removeAttribute('aria-disabled');}}
    if(on)target.setAttribute('aria-busy','true');else target.removeAttribute('aria-busy');return;}
  pbBusyN=Math.max(0,pbBusyN+(on?1:-1));
  if(!pbBusyBar){pbBusyBar=document.createElement('div');pbBusyBar.className='pb-busybar';pbBusyBar.hidden=true;pbBusyBar.setAttribute('role','progressbar');pbBusyBar.setAttribute('aria-label',pbStrings.busy);pbBusyBar.appendChild(document.createElement('span'));document.body.appendChild(pbBusyBar);}
  pbBusyBar.hidden=!pbBusyN;}

/* ---------- Media state: pbProcessing({variant:'lead'|'tile'|'note', state:'pending'|'failed', label, attrs}) returns the stand-in for a preview still being made
   (a skeleton and a word, announced politely); attrs adds attributes such as hx-get for polling. ---------- */
function pbProcessing(o){o=o||{};var v=o.variant||'lead',f=o.state==='failed',w=o.label||(f?pbStrings.failed:pbStrings.processing),tag=v==='note'?'p':'span',
  a=Object.keys(o.attrs||{}).map(function(k){return /^[a-z][\w:-]*$/i.test(k)?' '+k+'="'+pbEsc(o.attrs[k])+'"':'';}).join('');
  return '<'+tag+' class="pb-proc'+(v==='lead'?'':' pb-proc--'+pbEsc(v))+'"'+(f?' data-state="failed"':'')+' role="status"'+a+'>'+(f?'<span class="pb-icon pb-icon--status-down"></span>':'<span class="pb-skel '+(v==='tile'?'pb-proc__fill':'pb-proc__skel')+'" aria-hidden="true"></span>')+'<span class="pb-proc__word pb-mono">'+pbEsc(w)+'</span></'+tag+'>';}
/* Hover teaser: [data-teaser="/preview.mp4"] over an <img> poster. A mouse resting 250 ms, or keyboard focus (focus-visible) inside, plays a muted looping <video>
   over the poster with a thin progress line; leaving, blur, Esc or a hidden tab stops it and restores the poster. One plays at a time; touch and pen are ignored;
   Save-Data and a teaser that fails to load leave the poster alone. Under reduced motion it still plays, without the fade. */
var pbTeaserFailed={},pbTeaserCur=null,pbTeaserPend=null,pbTeaserDoc=false;
function pbTeaserStop(){if(pbTeaserPend){clearTimeout(pbTeaserPend.t);pbTeaserPend=null;}if(!pbTeaserCur)return;var a=pbTeaserCur;pbTeaserCur=null;cancelAnimationFrame(a.raf);a.v.pause();a.v.removeAttribute('src');a.v.load();a.v.remove();a.p.remove();a.fr.removeAttribute('data-teaser-frame');}
function pbTeaserStart(host){var url=host.getAttribute('data-teaser'),img=host.querySelector('img');if(!url||!img||pbTeaserFailed[url]||!host.isConnected||(navigator.connection&&navigator.connection.saveData))return;
  pbTeaserStop();var fr=img.parentElement,v=document.createElement('video'),p=document.createElement('div');v.className='pb-teaser__video';v.muted=true;v.loop=true;v.playsInline=true;v.preload='auto';v.setAttribute('aria-hidden','true');v.src=url;
  p.className='pb-progress pb-teaser__progress';p.appendChild(document.createElement('span'));fr.setAttribute('data-teaser-frame','');img.after(v);fr.appendChild(p);
  var a=pbTeaserCur={host:host,fr:fr,v:v,p:p,raf:0};
  function tick(){if(pbTeaserCur!==a)return;var d=v.duration;if(d>0&&isFinite(d))p.style.setProperty('--value',Math.min(100,v.currentTime/d*100).toFixed(2)+'%');a.raf=requestAnimationFrame(tick);}
  v.addEventListener('playing',function(){if(pbTeaserCur!==a)return;v.setAttribute('data-state','on');p.setAttribute('data-state','on');cancelAnimationFrame(a.raf);a.raf=requestAnimationFrame(tick);});
  v.addEventListener('error',function(){pbTeaserFailed[url]=true;if(pbTeaserCur===a)pbTeaserStop();});
  var pr=v.play();if(pr&&pr.catch)pr.catch(function(){if(pbTeaserCur===a)pbTeaserStop();});}
function pbTeaser(host){function arm(){if((pbTeaserPend&&pbTeaserPend.host===host)||(pbTeaserCur&&pbTeaserCur.host===host))return;pbTeaserStop();pbTeaserPend={host:host,t:setTimeout(function(){pbTeaserPend=null;pbTeaserStart(host);},250)};}
  function disarm(){if(pbTeaserPend&&pbTeaserPend.host===host||pbTeaserCur&&pbTeaserCur.host===host)pbTeaserStop();}
  host.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')arm();});host.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')disarm();});
  host.addEventListener('focusin',function(e){if(e.target.matches&&e.target.matches(':focus-visible'))arm();});host.addEventListener('focusout',function(e){if(!host.contains(e.relatedTarget))disarm();});
  host.addEventListener('keydown',function(e){if(e.key==='Escape')disarm();});
  if(!pbTeaserDoc){pbTeaserDoc=true;document.addEventListener('visibilitychange',function(){if(document.hidden)pbTeaserStop();});}}

/* ---------- ShareLink: pbShareLink({url, id, showLink}) returns a Copy link button and a QR popover as one group; showLink adds the link text and Open.
   An empty <span data-sharelink="https://…" [data-show-link]> fills itself the same way. The link must be http(s) or site-relative. ---------- */
function pbShareLink(o){var id=o.id||pbId('share'),ok=/^(https?:\/\/|\/(?!\/))/i.test(o.url||''),u=pbEsc(o.url),sl=o.showLink&&ok;
  return '<span class="pb-sharelink">'+(sl?'<a class="pb-link pb-link--quiet pb-mono pb-sharelink__url" href="'+u+'" title="'+u+'">'+u+'</a>':'')+'<span class="pb-btngroup"><button type="button" class="pb-btn pb-btn--sm" data-copy-value="'+u+'"><span class="pb-icon pb-icon--copy"></span><span>'+pbEsc(pbStrings.copyLink)+'</span></button>'+
    (sl?'<a class="pb-btn pb-btn--sm" href="'+u+'"><span class="pb-icon pb-icon--link-external"></span>'+pbEsc(pbStrings.open)+'</a>':'')+'<button type="button" class="pb-btn pb-btn--sm pb-btn--icon" popovertarget="'+id+'-qr" aria-label="'+pbEsc(pbStrings.qrCode)+'"><span class="pb-icon pb-icon--qr"></span></button></span></span>'+
    '<div class="pb-popover" id="'+id+'-qr" popover role="dialog" aria-label="'+pbEsc(pbStrings.qrCode)+'"><figure class="pb-qr pb-qr--bare" data-qr="'+u+'"><div class="pb-qr__code"></div><figcaption class="pb-qr__caption pb-mono">'+u+'</figcaption></figure></div>';}
function pbShareLinkEl(el){if(el.firstElementChild)return;el.innerHTML=pbShareLink({url:el.getAttribute('data-sharelink'),id:el.id||pbId('share'),showLink:el.hasAttribute('data-show-link')});pbInit(el);}

/* ---------- StorageRing: <button class="pb-ring" data-ring data-value="62" popovertarget="id"> draws a usage ring (data-value is a percent, or data-used and data-total; aria-label may hold {n} for the percent);
   data-warn (80) and data-down (95) set the level. The popover holds the breakdown (a Storage bar fits). el.pbSet(percent) redraws it. ---------- */
function pbRing(el){var R=10,tpl=el.getAttribute('aria-label')||pbStrings.ringLabel;
  function set(v){v=Math.max(0,Math.min(100,+v||0));el.dataset.level=v>=(+el.dataset.down||95)?'down':v>=(+el.dataset.warn||80)?'warn':'ok';
    var arc=el.querySelector('.pb-ring__arc');if(arc)arc.setAttribute('stroke-dasharray',v+' 100');el.setAttribute('aria-label',pbFmt(tpl,{n:Math.round(v)}));if(el.hasAttribute('data-show-value')){var pc=el.querySelector('.pb-ring__pct');if(!pc){pc=document.createElement('span');pc.className='pb-ring__pct';el.appendChild(pc);}pc.textContent=Math.round(v)+'%';}}
  if(!el.querySelector('svg')){el.insertAdjacentHTML('afterbegin','<svg class="pb-ring__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle class="pb-ring__track" cx="12" cy="12" r="'+R+'" pathLength="100"/><circle class="pb-ring__arc" cx="12" cy="12" r="'+R+'" pathLength="100" stroke-dasharray="0 100"/></svg>');}
  el.pbSet=set;set(el.dataset.value!=null?el.dataset.value:(+el.dataset.total?(+el.dataset.used/+el.dataset.total*100):0));}

/* ---------- Shortcut registry: pbShortcuts({'/': '#search', 'n': '/new', 'g o': fn, 'mod+enter': {do: fn, desc: 'Save', allowInInput: true}}, {scope, sheet, group}).
   A value is a function, a selector (focuses an input, clicks anything else), a URL or path (starts with /, ./, ../, ? or http(s):) or {do, desc, group, allowInInput, hidden}.
   Keys: letters, symbols, enter, esc, space, up, down, left, right, tab and mod / ctrl / alt / shift / meta prefixes joined with +; "g o" is a sequence (1 s between keys).
   mod is ⌘ on Apple and Ctrl elsewhere. Keys are ignored while typing in a field, except mod+ combos, Esc and entries with allowInInput; while a modal dialog is open only
   those fire too. ? opens the shortcut sheet (dialog.pb-keys; one is made if the page has none), which lists every entry that has a description (or a target with a label).
   Selector targets get aria-keyshortcuts. Returns {add(map), refresh(), open(), destroy()}. ---------- */
var pbKeyRegs=[],pbKeyAlias={esc:'escape',space:' ',up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright','return':'enter',del:'delete',plus:'+'},pbKeyHref=/^(?:https?:|mailto:|\/|\.{1,2}\/|\?)/i;
function pbKeyParse(spec){return String(spec).trim().split(/\s+/).map(function(st){var p=st.split('+'),k=p.pop().toLowerCase(),c={mod:0,ctrl:0,alt:0,shift:0,meta:0,key:pbKeyAlias[k]||k};p.forEach(function(m){m=m.toLowerCase();if(m in c)c[m]=1;});return c;});}
function pbKeyMatch(c,e){var k=e.key.toLowerCase(),mac=pbApple;if(k!==c.key)return false;if(e.metaKey!==!!(c.meta||(c.mod&&mac))||e.ctrlKey!==!!(c.ctrl||(c.mod&&!mac))||e.altKey!==!!c.alt)return false;
  return /^[a-z0-9]$/.test(c.key)?e.shiftKey===!!c.shift:(!c.shift||e.shiftKey);}
function pbKeyLabel(c){var mac=pbApple,t=[];if(c.mod)t.push(mac?'⌘':'Ctrl');if(c.ctrl)t.push(mac?'⌃':'Ctrl');if(c.alt)t.push(mac?'⌥':'Alt');if(c.shift)t.push(mac?'⇧':'Shift');if(c.meta)t.push(mac?'⌘':'Win');
  t.push({escape:'Esc',' ':'Space',enter:'↵',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',backspace:'⌫',delete:'Del',tab:'Tab'}[c.key]||(c.key.length===1?c.key.toUpperCase():c.key));return t;}
function pbKeyAria(c){var mac=pbApple,t=[];if(c.mod)t.push(mac?'Meta':'Control');if(c.ctrl)t.push('Control');if(c.alt)t.push('Alt');if(c.shift)t.push('Shift');if(c.meta)t.push('Meta');
  t.push({escape:'Escape',' ':'Space',enter:'Enter',arrowup:'ArrowUp',arrowdown:'ArrowDown',arrowleft:'ArrowLeft',arrowright:'ArrowRight',backspace:'Backspace',delete:'Delete',tab:'Tab'}[c.key]||(c.key.length===1?c.key.toUpperCase():c.key));return t.join('+');}
function pbKeyTyping(t){return !!(t&&t.closest&&t.closest('textarea,select,[contenteditable]:not([contenteditable="false"]),[role=textbox],[role=searchbox],[role=combobox],input:not([type=checkbox],[type=radio],[type=button],[type=submit],[type=reset],[type=range],[type=file],[type=color])'));}
function pbKeyDesc(en){if(en.desc)return en.desc;if(typeof en.do==='string'&&!pbKeyHref.test(en.do)){var t=document.querySelector(en.do);if(t)return t.getAttribute('aria-label')||t.getAttribute('title')||(t.textContent||'').trim().slice(0,60)||t.getAttribute('placeholder')||'';}return '';}
function pbKeysSheetOf(r,make){var s=r.o.sheet;if(typeof s==='string')s=document.querySelector(s);if(s)return s;s=document.querySelector('dialog.pb-keys');if(s||!make)return s;
  var id=pbId('keys');document.body.insertAdjacentHTML('beforeend','<dialog class="pb-dialog pb-keys" id="'+id+'" aria-labelledby="'+id+'-t"><header class="pb-dialog__head"><h2 class="pb-dialog__title" id="'+id+'-t">'+pbEsc(pbStrings.keysTitle)+'</h2><button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-close aria-label="'+pbEsc(pbStrings.close)+'"><span class="pb-icon pb-icon--close"></span></button></header><div class="pb-dialog__body"><span class="pb-input pb-keys__search"><span class="pb-icon pb-icon--search"></span><input type="search" placeholder="'+pbEsc(pbStrings.keysFind)+'" aria-label="'+pbEsc(pbStrings.keysFind)+'"></span><div class="pb-keys__groups"></div><p class="pb-keys__empty" hidden>'+pbEsc(pbStrings.keysNone)+'</p></div></dialog>');
  s=document.getElementById(id);pbInit(s,{only:['keys']});return s;}
/* Fills the sheet's generated groups from every registry (hand-written groups stay). */
function pbKeysRender(dlg){var G={},order=[],host=dlg.querySelector('.pb-keys__groups');if(!host)return;
  pbKeyRegs.forEach(function(r){var s=r.o.sheet&&(typeof r.o.sheet==='string'?document.querySelector(r.o.sheet):r.o.sheet);if(s&&s!==dlg)return;
    r.list.forEach(function(en){if(en.hidden)return;var d=pbKeyDesc(en);if(!d)return;var g=en.group||r.o.group||pbStrings.keysGeneral;if(!G[g]){G[g]=[];order.push(g);}G[g].push({d:d,en:en});});});
  host.querySelectorAll('[data-generated]').forEach(function(n){n.remove();});
  order.forEach(function(g){var h='<section class="pb-keys__group" data-generated><h3>'+pbEsc(g)+'</h3><dl>'+G[g].map(function(x){return '<div data-keywords="'+pbEsc(x.en.key.toLowerCase())+'"><dt>'+pbEsc(x.d)+'</dt><dd>'+x.en.steps.map(function(c){return pbKeyLabel(c).map(function(k){return '<span class="pb-kbd">'+pbEsc(k)+'</span>';}).join('');}).join(pbEsc(pbStrings.keysThen))+'</dd></div>';}).join('')+'</dl></section>';host.insertAdjacentHTML('beforeend',h);});
  if(dlg.pbFilter)dlg.pbFilter();}
function pbShortcuts(map,o){o=o||{};var reg={o:o,list:[],map:{}},sc=typeof o.scope==='string'?document.querySelector(o.scope):(o.scope||document);if(!sc)sc=document;
  function open(){var d=pbKeysSheetOf(reg,true);if(d&&d.pbOpen)d.pbOpen();}
  function entry(k,v){var e=(v&&typeof v==='object'&&!v.nodeType)?Object.assign({},v):{do:v};if(e.run&&!e.do)e.do=e.run;e.key=k;e.steps=pbKeyParse(k);e.i=0;e.t=0;return e;}
  function aria(){reg.list.forEach(function(en){if(en.steps.length!==1||typeof en.do!=='string'||pbKeyHref.test(en.do))return;var t=document.querySelector(en.do);if(!t)return;var a=pbKeyAria(en.steps[0]),cur=(t.getAttribute('aria-keyshortcuts')||'').split(/\s+/).filter(Boolean);if(cur.indexOf(a)<0)t.setAttribute('aria-keyshortcuts',cur.concat(a).join(' '));});}
  function add(m){Object.keys(m||{}).forEach(function(k){reg.map[k]=m[k];reg.list=reg.list.filter(function(x){return x.key!==k;});reg.list.push(entry(k,m[k]));});if(o.help!==false&&!reg.map['?']&&!reg.list.some(function(x){return x.key==='?';}))reg.list.push(entry('?',{do:open,hidden:true}));aria();}
  function run(en,e){var d=en.do;if(typeof d==='function'){d(e,en);return;}if(typeof d!=='string')return;if(pbKeyHref.test(d)){location.assign(d);return;}var t=document.querySelector(d);if(!t)return;
    if(t.matches('input,textarea,select,[contenteditable]')){t.focus();if(t.select&&t.matches('input,textarea'))t.select();}else t.click();}
  function onKey(e){if(e.defaultPrevented||e.isComposing||!e.key)return;var typing=pbKeyTyping(e.target),modal=document.querySelector('dialog:modal'),mine=sc!==document&&modal&&modal.contains(sc),done=false;
    reg.list.forEach(function(en){if(done)return;var c=en.steps[en.i];if(!pbKeyMatch(c,e)){if(!en.i)return;en.i=0;clearTimeout(en.t);c=en.steps[0];if(!pbKeyMatch(c,e))return;}
      var combo=c.mod||c.ctrl||c.meta,free=combo||c.key==='escape';if(!free&&((typing&&!en.allowInInput)||(modal&&!mine)||e.repeat)){en.i=0;return;}
      if(en.i<en.steps.length-1){en.i++;clearTimeout(en.t);en.t=setTimeout(function(){en.i=0;},1000);return;}
      en.i=0;clearTimeout(en.t);done=true;e.preventDefault();run(en,e);});}
  sc.addEventListener('keydown',onKey);
  reg.add=add;reg.open=open;reg.refresh=aria;reg.destroy=function(){sc.removeEventListener('keydown',onKey);var i=pbKeyRegs.indexOf(reg);if(i>=0)pbKeyRegs.splice(i,1);};
  pbKeyRegs.push(reg);add(map);return reg;}
