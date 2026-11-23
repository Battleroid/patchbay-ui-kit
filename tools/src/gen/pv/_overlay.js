/* pbConfirm(opts) → Promise<boolean>. pbToast(opts) → toast element with .update(opts) and .close(). pbInbox(el) wires a bell + inbox. */
function pbConfirm(o){o=o||{};return new Promise(function(res){var d=document.createElement('dialog');d.className='pb-dialog pb-dialog--sm';var st=o.danger?'down':(o.status||'');
  d.innerHTML='<form method="dialog"><div class="pb-dialog__head">'+(st?'<span class="pb-dialog__icon" data-status="'+st+'"><span class="pb-icon pb-icon--status-'+(st==='info'?'info':st)+'"></span></span>':'')+'<div><h3 class="pb-dialog__title">'+pbEsc(o.title||'Are you sure?')+'</h3></div></div>'+
   '<div class="pb-dialog__body">'+(o.body?'<p>'+o.body+'</p>':'')+(o.typeToConfirm?'<label class="pb-field"><span class="pb-field__label">Type <span class="pb-code-inline pb-code-inline--plain">'+pbEsc(o.typeToConfirm)+'</span> to confirm</span><span class="pb-input"><input autocomplete="off" spellcheck="false"></span></label>':'')+'</div>'+
   '<div class="pb-dialog__foot"><button class="pb-btn pb-btn--ghost" value="cancel">'+pbEsc(o.cancel||'Cancel')+'</button><button class="pb-btn '+(o.danger?'pb-btn--danger':'pb-btn--primary')+'" value="ok"'+(o.typeToConfirm?' disabled':'')+'>'+pbEsc(o.confirm||'Confirm')+'</button></div></form>',pbStyled(d);
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
      (st!=='busy'&&o.timeout!==0?'<span class="pb-toast__timer" data-style="--t:'+(o.timeout||(st==='down'?8000:5000))+'ms"></span>':''),pbStyled(t);
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
