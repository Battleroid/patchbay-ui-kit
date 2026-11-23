/* pbConfirm(opts) → Promise<boolean>. pbToast(opts) → toast element with .update(opts) and .close(). pbInbox(el, opts) wires a bell + inbox.
   body is text (escaped); bodyHTML is raw markup you trust; a Node passed as body is appended as is. */
var pbUid=0;
function pbBody(o,tag,cls){var id='pb'+(++pbUid);if(o.body!=null&&typeof o.body==='object'&&o.body.nodeType)return {id:id,html:'<div class="'+cls+'" id="'+id+'"></div>',node:o.body};
  if(o.bodyHTML!=null)return {id:id,html:'<'+tag+' class="'+cls+'" id="'+id+'">'+o.bodyHTML+'</'+tag+'>'};
  if(o.body!=null&&o.body!=='')return {id:id,html:'<'+tag+' class="'+cls+'" id="'+id+'">'+pbEsc(o.body)+'</'+tag+'>'};return null;}
function pbConfirm(o){o=o||{};return new Promise(function(res){var d=document.createElement('dialog');d.className='pb-dialog pb-dialog--sm';var st=o.danger?'down':(o.status||''),tid='pb'+(++pbUid),b=pbBody(o,'p','pb-dialog__text');
  d.innerHTML='<form method="dialog"><div class="pb-dialog__head">'+(st?'<span class="pb-dialog__icon" data-status="'+st+'"><span class="pb-icon pb-icon--status-'+(st==='info'?'info':st)+'"></span></span>':'')+'<div><h3 class="pb-dialog__title" id="'+tid+'">'+pbEsc(o.title||'Are you sure?')+'</h3></div></div>'+
   '<div class="pb-dialog__body">'+(b?b.html:'')+(o.typeToConfirm?'<label class="pb-field"><span class="pb-field__label">Type <span class="pb-code-inline pb-code-inline--plain">'+pbEsc(o.typeToConfirm)+'</span> to confirm</span><span class="pb-input"><input autocomplete="off" spellcheck="false"></span></label>':'')+'</div>'+
   '<div class="pb-dialog__foot"><button class="pb-btn pb-btn--ghost" value="cancel">'+pbEsc(o.cancel||'Cancel')+'</button><button class="pb-btn '+(o.danger?'pb-btn--danger':'pb-btn--primary')+'" value="ok"'+(o.typeToConfirm?' disabled':'')+'>'+pbEsc(o.confirm||'Confirm')+'</button></div></form>',pbStyled(d);
  d.setAttribute('aria-labelledby',tid);if(b){d.setAttribute('aria-describedby',b.id);if(b.node)d.querySelector('#'+b.id).appendChild(b.node);}
  (o.container||document.body).appendChild(d);var ok=d.querySelector('[value=ok]'),inp=d.querySelector('input');
  if(inp)inp.addEventListener('input',function(){ok.disabled=inp.value!==o.typeToConfirm;});
  d.addEventListener('close',function(){res(d.returnValue==='ok');d.remove();});d.showModal();(inp||d.querySelector('[value=cancel]')).focus();});}
function pbToast(o){o=o||{};var box=(o.container||document.body).querySelector(':scope > .pb-toasts:not(.pb-toasts--inline)');
  if(!box){box=document.createElement('ol');box.className='pb-toasts';box.setAttribute('aria-live','polite');box.setAttribute('aria-label','Notifications');(o.container||document.body).appendChild(box);}
  var t=document.createElement('li');t.className='pb-toast';box.appendChild(t);
  function close(){if(!t.isConnected)return;t.setAttribute('data-leaving','');setTimeout(function(){t.remove()},matchMedia('(prefers-reduced-motion: reduce)').matches?0:160);}
  function draw(p){p=p||{};if('body' in p&&!('bodyHTML' in p))delete o.bodyHTML;if('bodyHTML' in p&&!('body' in p))delete o.body;Object.assign(o,p);
    var st=o.status||'info',ic={ok:'status-ok',warn:'status-warn',down:'status-down',info:'status-info',busy:'refresh'}[st],b=pbBody(o,'p','pb-toast__body');
    t.dataset.status=st;t.className='pb-toast'+(o.ink?' pb-toast--ink':'');t.setAttribute('role',st==='down'?'alert':'status');
    t.innerHTML='<span class="pb-icon pb-icon--'+ic+(st==='busy'?' pb-spin':'')+'"></span><p class="pb-toast__title">'+pbEsc(o.title)+'</p>'+(b?b.html:'')+
      (o.actions&&o.actions.length?'<div class="pb-toast__actions">'+o.actions.map(function(a,i){return '<button type="button" class="pb-btn pb-btn--sm '+(i?'pb-btn--ghost':'')+'" data-i="'+i+'">'+pbEsc(a.label)+'</button>'}).join('')+'</div>':'')+
      '<button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-x aria-label="Dismiss"><span class="pb-icon pb-icon--close"></span></button>'+
      (st!=='busy'&&o.timeout!==0?'<span class="pb-toast__timer" data-style="--t:'+(o.timeout||(st==='down'?8000:5000))+'ms"></span>':''),pbStyled(t);
    if(b&&b.node)t.querySelector('#'+b.id).appendChild(b.node);
    var tm=t.querySelector('.pb-toast__timer');if(tm)tm.addEventListener('animationend',close);}
  t.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!t.contains(b)||b.closest('.pb-toast')!==t)return;if(b.hasAttribute('data-x'))return close();if(b.dataset.i==null)return;var a=o.actions[+b.dataset.i];if(a&&a.onClick)a.onClick(t);if(!a||a.close!==false)close();});
  t.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  var max=o.max||4;while(box.children.length>max)box.firstElementChild.remove();
  draw({});t.update=draw;t.close=close;return t;}
/* pbInbox(el, {unread, lazy, onOpen, onRead, onReadAll}): unread is a server count shown until items say otherwise; lazy is a function(panel) that fills the panel on first open
   (may return a Promise), or true to fetch the HTML at data-inbox-src into .pb-inbox__list. onRead(item, wasUnread) and the pb:read event fire for every item opened;
   read-all fires a cancelable pb:readall ({items}); cancel it, or pass onReadAll(items), and the button's default action (a form POST) is prevented. Calling it again on a bound inbox only updates the options. */
function pbInbox(w,opts){if(w.__pbInbox){Object.assign(w.__pbInbox,opts||{});w.pbSync();return w;}var O=w.__pbInbox=Object.assign({},opts||{}),loaded=false;
  var bell=w.querySelector('.pb-bell'),panel=w.querySelector('.pb-inbox'),count=bell.querySelector('.pb-bell__count');
  function sync(){var n=O.unread!=null?Math.max(0,+O.unread):panel.querySelectorAll('.pb-notif[data-unread]').length;if(count){count.textContent=n||'';n?count.removeAttribute('data-zero'):count.setAttribute('data-zero','');}bell.setAttribute('aria-label','Notifications'+(n?', '+n+' unread':''));
    var e=panel.querySelector('.pb-inbox__empty');if(e)e.hidden=!!panel.querySelector('.pb-notif');}
  function place(){pbPlace(bell,panel,{align:'end'});}
  function load(){var src=w.getAttribute('data-inbox-src')||panel.getAttribute('data-inbox-src');if(typeof O.lazy==='function')return O.lazy(panel);if(!src)return;
    return fetch(src,{credentials:'same-origin',headers:{'Accept':'text/html'}}).then(function(r){if(!r.ok)throw new Error('inbox '+r.status);return r.text();}).then(function(h){var l=panel.querySelector('.pb-inbox__list')||panel;l.innerHTML=h;pbStyled(l);});}
  function opened(){if(O.onOpen)O.onOpen(panel);if(O.lazy&&!loaded){loaded=true;panel.setAttribute('aria-busy','true');Promise.resolve(load()).then(function(){panel.removeAttribute('aria-busy');pbInit(panel);sync();if(panel.matches(':popover-open'))place();},function(){panel.removeAttribute('aria-busy');loaded=false;});}}
  if(panel.hasAttribute('popover')){bell.addEventListener('click',function(){if(panel.matches(':popover-open'))return panel.hidePopover();panel.showPopover();place();(panel.querySelector('.pb-notif')||panel).focus();opened();});pbOnDoc('scroll',w,function(){if(panel.matches(':popover-open'))place();});}
  panel.addEventListener('click',function(e){var ra=e.target.closest('[data-readall]');
    if(ra){var items=[].slice.call(panel.querySelectorAll('.pb-notif[data-unread]')),ev=new CustomEvent('pb:readall',{bubbles:true,cancelable:true,detail:{items:items}});
      if(!w.dispatchEvent(ev)||O.onReadAll)e.preventDefault();items.forEach(function(x){x.removeAttribute('data-unread')});if(O.unread!=null)O.unread=0;if(O.onReadAll)O.onReadAll(items);sync();return;}
    var n=e.target.closest('.pb-notif');if(!n)return;var was=n.hasAttribute('data-unread');n.removeAttribute('data-unread');if(was&&O.unread!=null)O.unread=Math.max(0,O.unread-1);
    w.dispatchEvent(new CustomEvent('pb:read',{bubbles:true,detail:{item:n,wasUnread:was}}));if(O.onRead)O.onRead(n,was);sync();});
  panel.addEventListener('keydown',function(e){var n=e.target.closest('.pb-notif');if(!n)return;if(e.key==='Enter'){n.click();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();var s=e.key==='ArrowDown'?n.nextElementSibling:n.previousElementSibling;if(s)s.focus();}});
  w.pbSync=sync;w.pbUnread=function(n){O.unread=n;sync();};if(!panel.hasAttribute('popover'))opened();
  sync();return w;}
