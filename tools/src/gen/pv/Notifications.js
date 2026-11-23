/* Patchbay core: escaping, CSP-safe styling, delegated document listeners, placement, and the pbInit() hook registry. */
function pbEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
/* Markup built as a string carries styles in data-style; pbStyled moves them into the CSSOM, which a strict style-src allows. */
function pbStyled(c){if(!c||!c.querySelectorAll)return c;var l=[].slice.call(c.querySelectorAll('[data-style]'));if(c.hasAttribute&&c.hasAttribute('data-style'))l.unshift(c);
  l.forEach(function(n){n.style.cssText=n.getAttribute('data-style');n.removeAttribute('data-style');});return c;}
/* data-vars="--w:42%;--c:var(--chart-2)" sets custom properties without a style attribute. */
function pbVars(el){(el.getAttribute('data-vars')||'').split(';').forEach(function(d){var i=d.indexOf(':');if(i<0)return;var k=d.slice(0,i).trim(),v=d.slice(i+1).trim();
  if(!/^--[a-z0-9-]+$/.test(k)||!v||/url\(|expression|[;{}<>]/i.test(v))return;el.style.setProperty(k,v);});}
/* One capturing listener per event type on document (window for resize); entries drop out once their element leaves the page. */
var pbDocL={};
function pbOnDoc(type,el,fn){var L=pbDocL[type];
  if(!L){L=pbDocL[type]=new Set();(type==='resize'?window:document).addEventListener(type,function(e){L.forEach(function(x){
    if(!x.el.isConnected){if(x.seen)L.delete(x);return;}x.seen=true;try{x.fn(e);}catch(err){console.error('[patchbay] '+type,err);}});},true);}
  var x={el:el,fn:fn,seen:el.isConnected};L.add(x);return function(){L.delete(x);};}
function pbPlace(trigger,panel,o){o=o||{};var r=o.rect||trigger.getBoundingClientRect(),w=panel.offsetWidth,h=panel.offsetHeight,g=o.gap==null?8:o.gap;
  var below=r.bottom+g+h<=innerHeight||r.top-g-h<0,y=below?r.bottom+g:r.top-g-h,x=o.align==='end'?r.right-w:(o.align==='center'?r.left+r.width/2-w/2:r.left);
  x=Math.max(8,Math.min(x,innerWidth-w-8));panel.style.left=x+'px';panel.style.top=Math.max(8,y)+'px';panel.dataset.side=below?'bottom':'top';
  panel.style.setProperty('--ax',Math.max(10,Math.min(w-20,r.left+r.width/2-x-5))+'px');}
/* pbHook(name, selector, fn) registers a behavior; pbInit(root, {only, skip}) binds every registered hook under root once per element. */
var pbHooks=[],pbBound=new WeakMap();
function pbHook(name,sel,fn){for(var i=0;i<pbHooks.length;i++)if(pbHooks[i].name===name)return;pbHooks.push({name:name,sel:sel,fn:fn});pbInit.hooks.push(name);}
function pbInit(root,opts){root=root||document;opts=opts||{};
  var list=function(v){return v==null?null:(typeof v==='string'?v.split(/[\s,]+/).filter(Boolean):[].slice.call(v));},only=list(opts.only),skip=list(opts.skip)||[];
  pbHooks.forEach(function(h){if(only&&only.indexOf(h.name)<0||skip.indexOf(h.name)>=0)return;
    var els=[].slice.call(root.querySelectorAll(h.sel));if(root.matches&&root.matches(h.sel))els.unshift(root);
    els.forEach(function(el){if(el.closest('[data-pb-skip~="'+h.name+'"]'))return;var s=pbBound.get(el);if(!s){s=new Set();pbBound.set(el,s);}if(s.has(h.name))return;s.add(h.name);
      try{h.fn(el);}catch(err){console.error('[patchbay] '+h.name,err);}});});
  return root;}
pbInit.hooks=[];
/* pbConfirm(opts) → Promise<boolean>. pbToast(opts) → toast element with .update(opts) and .close(). pbInbox(el) wires a bell + inbox. */
function pbConfirm(o){o=o||{};return new Promise(function(res){var d=document.createElement('dialog');d.className='pb-dialog pb-dialog--sm';var st=o.danger?'down':(o.status||'');
  d.innerHTML='<form method="dialog"><div class="pb-dialog__head">'+(st?'<span class="pb-dialog__icon" data-status="'+st+'"><span class="pb-icon pb-icon--status-'+(st==='info'?'info':st)+'"></span></span>':'')+'<div><h3 class="pb-dialog__title">'+pbEsc(o.title||'Are you sure?')+'</h3></div></div>'+
   '<div class="pb-dialog__body">'+(o.body?'<p>'+o.body+'</p>':'')+(o.typeToConfirm?'<label class="pb-field"><span class="pb-field__label">Type <span class="pb-code-inline" style="text-transform:none;letter-spacing:0">'+pbEsc(o.typeToConfirm)+'</span> to confirm</span><span class="pb-input"><input autocomplete="off" spellcheck="false"></span></label>':'')+'</div>'+
   '<div class="pb-dialog__foot"><button class="pb-btn pb-btn--ghost" value="cancel">'+pbEsc(o.cancel||'Cancel')+'</button><button class="pb-btn '+(o.danger?'pb-btn--danger':'pb-btn--primary')+'" value="ok"'+(o.typeToConfirm?' disabled':'')+'>'+pbEsc(o.confirm||'Confirm')+'</button></div></form>';
  (o.container||document.body).appendChild(d);var ok=d.querySelector('[value=ok]'),inp=d.querySelector('input');
  if(inp)inp.addEventListener('input',function(){ok.disabled=inp.value!==o.typeToConfirm;});
  d.addEventListener('close',function(){res(d.returnValue==='ok');d.remove();});d.showModal();(inp||d.querySelector('[value=cancel]')).focus();});}
function pbToast(o){o=o||{};var box=(o.container||document.body).querySelector(':scope > .pb-toasts:not(.pb-toasts--inline)');
  if(!box){box=document.createElement('ol');box.className='pb-toasts';box.setAttribute('aria-live','polite');box.setAttribute('aria-label','Notifications');(o.container||document.body).appendChild(box);}
  var t=document.createElement('li');t.className='pb-toast';box.appendChild(t);
  function close(){if(!t.isConnected)return;t.setAttribute('data-leaving','');setTimeout(function(){t.remove()},matchMedia('(prefers-reduced-motion: reduce)').matches?0:160);}
  function draw(p){Object.assign(o,p);var st=o.status||'info',ic={ok:'status-ok',warn:'status-warn',down:'status-down',info:'status-info',busy:'refresh'}[st];
    t.dataset.status=st;t.className='pb-toast'+(o.ink?' pb-toast--ink':'');t.setAttribute('role',st==='down'?'alert':'status');
    t.innerHTML='<span class="pb-icon pb-icon--'+ic+(st==='busy'?' pb-spin':'')+'"></span><p class="pb-toast__title">'+pbEsc(o.title)+'</p>'+(o.body?'<p class="pb-toast__body">'+o.body+'</p>':'')+
      (o.actions&&o.actions.length?'<div class="pb-toast__actions">'+o.actions.map(function(a,i){return '<button type="button" class="pb-btn pb-btn--sm '+(i?'pb-btn--ghost':'')+'" data-i="'+i+'">'+pbEsc(a.label)+'</button>'}).join('')+'</div>':'')+
      '<button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-x aria-label="Dismiss"><span class="pb-icon pb-icon--close"></span></button>'+
      (st!=='busy'&&o.timeout!==0?'<span class="pb-toast__timer" style="--t:'+(o.timeout||(st==='down'?8000:5000))+'ms"></span>':'');
    var tm=t.querySelector('.pb-toast__timer');if(tm)tm.addEventListener('animationend',close);}
  t.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-x'))return close();var a=o.actions[+b.dataset.i];if(a&&a.onClick)a.onClick(t);if(!a||a.close!==false)close();});
  t.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  var max=o.max||4;while(box.children.length>max)box.firstElementChild.remove();
  draw({});t.update=draw;t.close=close;return t;}
function pbInbox(w){var bell=w.querySelector('.pb-bell'),panel=w.querySelector('.pb-inbox'),count=bell.querySelector('.pb-bell__count');
  function sync(){var n=panel.querySelectorAll('.pb-notif[data-unread]').length;count.textContent=n||'';n?count.removeAttribute('data-zero'):count.setAttribute('data-zero','');bell.setAttribute('aria-label','Notifications'+(n?', '+n+' unread':''));
    var e=panel.querySelector('.pb-inbox__empty');if(e)e.hidden=!!panel.querySelector('.pb-notif');}
  function place(){var r=bell.getBoundingClientRect();panel.style.top=(r.bottom+8)+'px';panel.style.left=Math.max(8,Math.min(r.right-panel.offsetWidth,innerWidth-panel.offsetWidth-8))+'px';}
  if(panel.hasAttribute('popover')){bell.addEventListener('click',function(){panel.matches(':popover-open')?panel.hidePopover():(panel.showPopover(),place(),(panel.querySelector('.pb-notif')||panel).focus());});addEventListener('scroll',function(){if(panel.matches(':popover-open'))place();},true);}
  panel.addEventListener('click',function(e){var n=e.target.closest('.pb-notif');if(n){n.removeAttribute('data-unread');sync();}if(e.target.closest('[data-readall]')){panel.querySelectorAll('.pb-notif[data-unread]').forEach(function(x){x.removeAttribute('data-unread')});sync();}});
  panel.addEventListener('keydown',function(e){var n=e.target.closest('.pb-notif');if(!n)return;if(e.key==='Enter'){n.click();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();var s=e.key==='ArrowDown'?n.nextElementSibling:n.previousElementSibling;if(s)s.focus();}});
  sync();}
/* pbInit() hooks, bound in this order: pbHook(name, selector, behavior). Skip one with data-pb-skip="name" on an ancestor or pbInit(root, {skip:['name']}). */
pbHook('vars','[data-vars]',pbVars);
pbHook('inbox','[data-inbox]',pbInbox);
pbInit();
