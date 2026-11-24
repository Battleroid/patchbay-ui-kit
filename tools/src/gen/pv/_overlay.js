/* pbConfirm(opts) → Promise<boolean>. pbToast(opts) → toast element with .update(opts) and .close(). pbInbox(el, opts) wires a bell + inbox.
   body is text (escaped); bodyHTML is raw markup you trust; a Node passed as body is appended as is. */
function pbBody(o,tag,cls){var id=pbId('pb-body');if(o.body!=null&&typeof o.body==='object'&&o.body.nodeType)return {id:id,html:'<div class="'+cls+'" id="'+id+'"></div>',node:o.body};
  if(o.bodyHTML!=null)return {id:id,html:'<'+tag+' class="'+cls+'" id="'+id+'">'+o.bodyHTML+'</'+tag+'>'};
  if(o.body!=null&&o.body!=='')return {id:id,html:'<'+tag+' class="'+cls+'" id="'+id+'">'+pbEsc(o.body)+'</'+tag+'>'};return null;}
function pbConfirm(o){o=o||{};return new Promise(function(res){var d=document.createElement('dialog');d.className='pb-dialog pb-dialog--sm';var st=o.danger?'down':(o.status||''),tid=pbId('pb-confirm'),iid=tid+'-input',b=pbBody(o,'p','pb-dialog__text');
  var tt=String(pbStrings.typeToConfirm).split('{text}'),code='<span class="pb-code-inline pb-code-inline--plain">'+pbEsc(o.typeToConfirm)+'</span>';
  d.innerHTML='<form method="dialog"><div class="pb-dialog__head">'+(st?'<span class="pb-dialog__icon" data-status="'+st+'"><span class="pb-icon pb-icon--status-'+(st==='info'?'info':st)+'"></span></span>':'')+'<div><h3 class="pb-dialog__title" id="'+tid+'">'+pbEsc(o.title||pbStrings.areYouSure)+'</h3></div></div>'+
   '<div class="pb-dialog__body">'+(b?b.html:'')+(o.typeToConfirm?'<div class="pb-field"><label class="pb-field__label" for="'+iid+'">'+pbEsc(tt[0])+code+pbEsc(tt.slice(1).join(''))+'</label><span class="pb-input"><input id="'+iid+'" autocomplete="off" spellcheck="false"></span></div>':'')+'</div>'+
   '<div class="pb-dialog__foot"><button class="pb-btn pb-btn--ghost" value="cancel">'+pbEsc(o.cancel||pbStrings.cancel)+'</button><button class="pb-btn '+(o.danger?'pb-btn--danger':'pb-btn--primary')+'" value="ok"'+(o.typeToConfirm?' disabled':'')+'>'+pbEsc(o.confirm||pbStrings.confirm)+'</button></div></form>',pbStyled(d);
  d.setAttribute('aria-labelledby',tid);if(b){d.setAttribute('aria-describedby',b.id);if(b.node)d.querySelector('#'+b.id).appendChild(b.node);}
  (o.container||document.body).appendChild(d);var ok=d.querySelector('[value=ok]'),inp=d.querySelector('input');
  if(inp)inp.addEventListener('input',function(){ok.disabled=inp.value!==o.typeToConfirm;});
  d.addEventListener('close',function(){res(d.returnValue==='ok');d.remove();});d.showModal();(inp||d.querySelector('[value=cancel]')).focus();});}
/* pbToast(opts) → the toast element, with .update(opts) and .close(). opts: title; body (text) | bodyHTML (trusted markup) | a Node; status ok|warn|down|info|busy
   or variant success|warning|error|info; action {label, onClick(toast), close} and/or actions [...]; timeout in ms (0 keeps it); ink; container; max.
   At most max (default 3) show at once; later ones wait, hidden, in order, and show as others close. Errors (status down, variant error) and busy toasts
   stay until dismissed or updated; others leave after 5 s, paused while hovered or focused. Each toast, and each status change, is announced through
   pbAnnounce (errors assertively): the toast stack is a labelled region, not a live region, so nothing is read twice or lost on the first toast. */
var PB_VARIANT={error:'down',danger:'down',success:'ok',warning:'warn',info:'info'};
function pbToastNext(box){var max=box.__pbMax||3,vis=box.querySelectorAll(':scope > .pb-toast:not([hidden]):not([data-leaving])').length;
  [].slice.call(box.querySelectorAll(':scope > .pb-toast[data-queued]')).forEach(function(t){if(vis<max){vis++;t.__pbShow();}});}
function pbToast(o){o=o||{};var box=pbToastRegion(o.container||document.body),t=document.createElement('div'),spoken=null;t.className='pb-toast';if(o.max)box.__pbMax=o.max;
  function norm(p){if(p.variant&&!p.status)p.status=PB_VARIANT[p.variant]||p.variant;if(p.action&&!p.actions)p.actions=[p.action];return p;}
  function close(){if(!t.isConnected||t.hasAttribute('data-leaving'))return;if(t.hasAttribute('data-queued')){t.remove();return;}pbFocusNear(t);t.setAttribute('data-leaving','');
    setTimeout(function(){t.remove();pbToastNext(box);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:160);}
  function say(){if(t.hidden)return;var st=o.status||'info';if(spoken===st)return;spoken=st;var bd=t.querySelector('.pb-toast__body');
    pbAnnounce([o.title,bd&&bd.textContent].filter(function(x){return x&&String(x).trim();}).join('. '),{assertive:st==='down'});}
  function draw(p){p=norm(p||{});if('body' in p&&!('bodyHTML' in p))delete o.bodyHTML;if('bodyHTML' in p&&!('body' in p))delete o.body;if('status' in p)delete o.variant;Object.assign(o,p);
    var st=o.status||'info',ic={ok:'status-ok',warn:'status-warn',down:'status-down',info:'status-info',busy:'refresh'}[st]||'status-info',b=pbBody(o,'p','pb-toast__body'),
      ms=st==='busy'?0:o.timeout!=null?o.timeout:st==='down'?0:5000;
    t.dataset.status=st;t.className='pb-toast'+(o.ink?' pb-toast--ink':'');
    t.innerHTML='<span class="pb-icon pb-icon--'+ic+(st==='busy'?' pb-icon--spin':'')+'" aria-hidden="true"></span><p class="pb-toast__title">'+pbEsc(o.title)+'</p>'+(b?b.html:'')+
      (o.actions&&o.actions.length?'<div class="pb-toast__actions">'+o.actions.map(function(a,i){return '<button type="button" class="pb-btn pb-btn--sm '+(i?'pb-btn--ghost':'')+'" data-i="'+i+'">'+pbEsc(a.label)+'</button>'}).join('')+'</div>':'')+
      '<button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-x aria-label="'+pbEsc(pbStrings.dismiss)+'"><span class="pb-icon pb-icon--close"></span></button>'+
      (ms?'<span class="pb-toast__timer" data-style="--t:'+ms+'ms"></span>':''),pbStyled(t);
    if(b&&b.node)t.querySelector('#'+b.id).appendChild(b.node);
    var tm=t.querySelector('.pb-toast__timer');if(tm)tm.addEventListener('animationend',close);say();}
  t.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!t.contains(b)||b.closest('.pb-toast')!==t)return;if(b.hasAttribute('data-x'))return close();if(b.dataset.i==null)return;var a=o.actions[+b.dataset.i];if(a&&a.onClick)a.onClick(t);if(!a||a.close!==false)close();});
  t.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  t.__pbShow=function(){t.hidden=false;t.removeAttribute('data-queued');say();};
  var max=box.__pbMax||3;if(box.querySelectorAll(':scope > .pb-toast:not([hidden]):not([data-leaving])').length>=max){t.hidden=true;t.setAttribute('data-queued','');}
  box.appendChild(t);draw(o);t.update=draw;t.close=close;return t;}
/* pbInbox(el, {unread, lazy, onOpen, onRead, onReadAll}): unread is a server count shown until items say otherwise; lazy is a function(panel) that fills the panel on first open
   (may return a Promise), or true to fetch the HTML at data-inbox-src into .pb-inbox__list. onRead(item, wasUnread) and the pb:read event fire for every item opened;
   read-all fires a cancelable pb:readall ({items}); cancel it, or pass onReadAll(items), and the button's default action (a form POST) is prevented. Calling it again on a bound inbox only updates the options. */
function pbInbox(w,opts){if(w.__pbInbox){Object.assign(w.__pbInbox,opts||{});w.pbSync();return w;}var O=w.__pbInbox=Object.assign({},opts||{}),loaded=false;
  var bell=w.querySelector('.pb-bell'),panel=w.querySelector('.pb-inbox'),count=bell.querySelector('.pb-bell__count');
  function sync(){var n=O.unread!=null?Math.max(0,+O.unread):panel.querySelectorAll('.pb-notif[data-unread]').length;if(count){count.textContent=n||'';n?count.removeAttribute('data-zero'):count.setAttribute('data-zero','');}bell.setAttribute('aria-label',pbStrings.notifications+(n?', '+pbStrings.unread.replace('{n}',n):''));
    var e=panel.querySelector('.pb-inbox__empty');if(e)e.hidden=!!panel.querySelector('.pb-notif');}
  function place(){pbPlace(bell,panel,{align:'end'});}
  function load(){var src=w.getAttribute('data-inbox-src')||panel.getAttribute('data-inbox-src');if(typeof O.lazy==='function')return O.lazy(panel);if(!src)return;
    return fetch(src,{credentials:'same-origin',headers:{'Accept':'text/html'}}).then(function(r){if(!r.ok)throw new Error('inbox '+r.status);return r.text();}).then(function(h){var l=panel.querySelector('.pb-inbox__list')||panel;l.innerHTML=h;pbStyled(l);});}
  function opened(){if(O.onOpen)O.onOpen(panel);if(O.lazy&&!loaded){loaded=true;panel.setAttribute('aria-busy','true');Promise.resolve(load()).then(function(){panel.removeAttribute('aria-busy');pbInit(panel);sync();if(panel.matches(':popover-open'))place();},function(){panel.removeAttribute('aria-busy');loaded=false;});}}
  /* The bell toggles the panel. With popovertarget the browser does it and we only follow the toggle; without it, a pointerdown that light-dismissed the panel must not reopen it on click. */
  if(panel.hasAttribute('popover')){var native=!!panel.id&&bell.getAttribute('popovertarget')===panel.id,was=false;
    panel.addEventListener('toggle',function(e){if(e.newState==='open'){place();(panel.querySelector('.pb-notif')||panel).focus();opened();}});
    if(!native){bell.addEventListener('pointerdown',function(){was=panel.matches(':popover-open');});
      bell.addEventListener('click',function(){var open=panel.matches(':popover-open'),skip=was;was=false;if(open)panel.hidePopover();else if(!skip)panel.showPopover();});}
    pbOnDoc('scroll',w,function(){if(panel.matches(':popover-open'))place();});}
  panel.addEventListener('click',function(e){var ra=e.target.closest('[data-readall]');
    if(ra){var items=[].slice.call(panel.querySelectorAll('.pb-notif[data-unread]')),ev=new CustomEvent('pb:readall',{bubbles:true,cancelable:true,detail:{items:items}});
      if(!w.dispatchEvent(ev)||O.onReadAll)e.preventDefault();items.forEach(function(x){x.removeAttribute('data-unread')});if(O.unread!=null)O.unread=0;if(O.onReadAll)O.onReadAll(items);sync();return;}
    var n=e.target.closest('.pb-notif');if(!n)return;var was=n.hasAttribute('data-unread');n.removeAttribute('data-unread');if(was&&O.unread!=null)O.unread=Math.max(0,O.unread-1);
    w.dispatchEvent(new CustomEvent('pb:read',{bubbles:true,detail:{item:n,wasUnread:was}}));if(O.onRead)O.onRead(n,was);sync();});
  panel.addEventListener('keydown',function(e){var n=e.target.closest('.pb-notif');if(!n)return;if(e.key==='Enter'){n.click();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();var s=e.key==='ArrowDown'?n.nextElementSibling:n.previousElementSibling;if(s)s.focus();}});
  w.pbSync=sync;w.pbUnread=function(n){O.unread=n;sync();};if(!panel.hasAttribute('popover'))opened();
  sync();return w;}
