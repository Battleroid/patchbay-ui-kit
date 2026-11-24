/* Patchbay app-level behaviors: theme, shell, popover placement, tree, command palette, context menu, lightbox, avatars, pager, validation, relative time, truncation, QR, splitter. */
function pbTheme(v,target){target=target||document.documentElement;var dark=v==='dark'||(v==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);target.dataset.theme=dark?'dark':'light';target.dataset.themeChoice=v;
  if(target===document.documentElement)try{localStorage.setItem('pb-theme',v)}catch(e){}}
function pbThemeSwitch(sw){var scope=sw.closest('[data-theme-scope]')||document.documentElement,saved=null;
  if(scope===document.documentElement)try{saved=localStorage.getItem('pb-theme')}catch(e){}
  var inh=scope!==document.documentElement&&scope.parentElement?(scope.parentElement.closest('[data-theme]')||{dataset:{}}).dataset.theme:null,cur=saved||scope.dataset.themeChoice||inh||'system';sw.querySelectorAll('input').forEach(function(i){i.checked=i.value===cur;i.addEventListener('change',function(){if(i.checked)pbTheme(i.value,scope);});});
  pbTheme(cur,scope);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(scope.dataset.themeChoice==='system')pbTheme('system',scope);});}
/* App shell. At phone width the nav is a modal drawer: opening it moves focus to the first nav item, makes the rest of the shell inert (the Menu
   button stays live so it can close it), and shows a scrim; Esc, the scrim, an outside click or Menu close it and focus returns to Menu.
   Widening the window past the phone layout closes it, so nothing stays inert. */
function pbShell(sh){var b=sh.querySelector('[data-nav-toggle]'),nav=sh.querySelector('.pb-shell__nav'),scrim=null,fenced=[];
  function modal(){return !!(b&&nav&&b.getClientRects().length);}
  function fence(on){fenced.forEach(function(x){x.inert=false;});fenced=[];if(!on)return;var keep=[nav,scrim,b];
    (function walk(p){[].forEach.call(p.children,function(c){if(keep.indexOf(c)>=0)return;if(keep.some(function(k){return k&&c.contains(k);})){walk(c);return;}
      if(c.inert||c.matches('script,style,template,[aria-live],[data-pb-live],.pb-toasts'))return;c.inert=true;fenced.push(c);});})(sh);}
  function set(o,back){o=!!o;var was=sh.hasAttribute('data-nav-open'),m=o&&modal();sh.toggleAttribute('data-nav-open',o);if(b)b.setAttribute('aria-expanded',o);fence(m);
    if(m&&!was){var f=nav.querySelector('.pb-nav__item,a[href],button:not([disabled])');if(f)f.focus();}
    if(!o&&was&&back&&b&&modal())b.focus();}
  if(nav){scrim=document.createElement('div');scrim.className='pb-shell__scrim';scrim.setAttribute('aria-hidden','true');nav.after(scrim);scrim.addEventListener('click',function(){set(false,true);});}
  if(b)b.addEventListener('click',function(){set(!sh.hasAttribute('data-nav-open'),true);});
  sh.addEventListener('keydown',function(e){if(e.key==='Escape'&&sh.hasAttribute('data-nav-open')){e.preventDefault();set(false,true);}});
  pbOnDoc('click',sh,function(e){if(sh.hasAttribute('data-nav-open')&&nav&&!nav.contains(e.target)&&!(b&&b.contains(e.target))&&e.target!==scrim)set(false);});
  pbOnDoc('resize',sh,function(){if(sh.hasAttribute('data-nav-open')&&!modal())set(false);});
  sh.querySelectorAll('.pb-nav__item[aria-expanded]').forEach(function(t){var sub=t.nextElementSibling;t.addEventListener('click',function(){var o=t.getAttribute('aria-expanded')!=='true';t.setAttribute('aria-expanded',o);if(sub)sub.hidden=!o;});});}
function pbPopover(t){var p=document.getElementById(t.getAttribute('popovertarget'));if(!p||p.__pbPlaced)return;p.__pbPlaced=true;
  p.addEventListener('toggle',function(e){if(e.newState==='open'){pbPlace(t,p,{align:p.dataset.align||t.dataset.align});var f=p.querySelector('[autofocus],.pb-menu__item');if(f&&p.classList.contains('pb-menu'))f.focus();}});}
/* Keyboard for [popover][role=menu]: first item focused on open, ↑/↓ cycle, Home/End, type a letter to jump (pbListKeys). */
function pbMenuKeys(m){if(m.__pbKeys)return;pbListKeys(m,{selector:'[role^=menuitem],.pb-menu__item',typeahead:true});
  m.addEventListener('toggle',function(e){if(e.newState==='open'){var l=m.__pbKeys.items(),f=m.querySelector('[autofocus]')||l[0];if(f)setTimeout(function(){f.focus();});}});}
function pbHovercard(t){var p=document.getElementById(t.dataset.hovercard),tm;if(!p)return;p.setAttribute('popover','manual');
    function open(){clearTimeout(tm);tm=setTimeout(function(){if(!p.matches(':popover-open')){p.showPopover();pbPlace(t,p);}},300);}
    function close(){clearTimeout(tm);tm=setTimeout(function(){if(p.matches(':popover-open'))p.hidePopover();},200);}
    t.addEventListener('mouseenter',open);t.addEventListener('mouseleave',close);t.addEventListener('focus',open);t.addEventListener('blur',close);
    p.addEventListener('mouseenter',function(){clearTimeout(tm)});p.addEventListener('mouseleave',close);t.addEventListener('keydown',function(e){if(e.key==='Escape')p.hidePopover();});}
function pbPopovers(root){pbInit(root||document,{only:['popover','hovercard']});}
function pbTree(tree){var items=function(){return [].filter.call(tree.querySelectorAll('[role=treeitem]'),function(i){var p=i.parentElement.closest('[role=treeitem]');while(p){if(p.getAttribute('aria-expanded')==='false')return false;p=p.parentElement.closest('[role=treeitem]');}return true;});};
  var all=tree.querySelectorAll('[role=treeitem]');all.forEach(function(i){i.tabIndex=-1;});var first=tree.querySelector('[role=treeitem][aria-selected=true]')||all[0];if(first)first.tabIndex=0;
  function focus(i){all.forEach(function(x){x.tabIndex=-1});i.tabIndex=0;i.focus();}
  function toggle(i,o){if(!i.hasAttribute('aria-expanded'))return;o=o==null?i.getAttribute('aria-expanded')!=='true':o;i.setAttribute('aria-expanded',o);if(o)pbEmit(tree,'pb:expand',i);}
  function select(i){tree.querySelectorAll('[aria-selected=true]').forEach(function(x){x.setAttribute('aria-selected','false')});i.setAttribute('aria-selected','true');pbEmit(tree,'pb:select',i);}
  tree.addEventListener('click',function(e){var row=e.target.closest('.pb-tree__row');if(!row)return;var i=row.parentElement;if(e.target.closest('.pb-tree__caret'))toggle(i);else{select(i);if(i.hasAttribute('aria-expanded')&&e.detail===2)toggle(i);}focus(i);});
  tree.addEventListener('keydown',function(e){var i=e.target.closest('[role=treeitem]');if(!i)return;var v=items(),k=v.indexOf(i),key=e.key,ex=i.getAttribute('aria-expanded');
    if(key==='ArrowDown'&&v[k+1])focus(v[k+1]);else if(key==='ArrowUp'&&v[k-1])focus(v[k-1]);else if(key==='Home')focus(v[0]);else if(key==='End')focus(v[v.length-1]);
    else if(key==='ArrowRight'){if(ex==='false')toggle(i,true);else if(ex==='true'){var c=i.querySelector('[role=treeitem]');if(c)focus(c);}}
    else if(key==='ArrowLeft'){if(ex==='true')toggle(i,false);else{var p=i.parentElement.closest('[role=treeitem]');if(p)focus(p);}}
    else if(key==='Enter'||key===' ')select(i);else if(key==='*'){[].forEach.call(i.parentElement.children,function(s){toggle(s,true)});}else return;e.preventDefault();});}
/* Command palette: dialog.pb-cmd. Opens on ⌘K / Ctrl+K and from any data-pb-open="#id" button (it resets on pb:show). Items are li.pb-cmd__item in
   the markup, plus sections from a <script type="application/json"> inside the dialog or from data-cmd-src (a URL returning the same JSON,
   fetched on first open): [{label, items:[{label, href | action, keywords, hint, icon}]}] or {sections:[…]}. Running an item closes the
   palette and fires a cancelable pb:command {command, label, href, item}; an item with href is followed unless a listener cancels it. */
function pbCommand(dlg){var inp=dlg.querySelector('input'),list=dlg.querySelector('.pb-cmd__list'),empty=dlg.querySelector('.pb-cmd__empty'),loaded=false,nav=false;
  if(!list.id)list.id=pbId('pb-cmd-list');inp.setAttribute('aria-controls',list.id);if(!inp.getAttribute('role'))inp.setAttribute('role','combobox');inp.setAttribute('aria-autocomplete','list');
  function all(){return [].slice.call(list.querySelectorAll('.pb-cmd__item'));}
  function vis(){return all().filter(function(i){return !i.hidden;});}
  function prep(it){if(it.__pbCmd)return;it.__pbCmd=1;it.dataset.label=it.dataset.label||(it.querySelector('.pb-cmd__label')||it).textContent.trim();it.setAttribute('role','option');it.setAttribute('aria-selected','false');if(!it.id)it.id=pbId('pb-cmd');}
  function safe(h){return !/^\s*[a-z][a-z0-9+.-]*:/i.test(h)||/^\s*https?:/i.test(h);}
  function add(data){var secs=Array.isArray(data)?data:(data&&data.sections)||[],h='';
    secs.forEach(function(s){if(s.label)h+='<li class="pb-cmd__group" role="presentation">'+pbEsc(s.label)+'</li>';
      (s.items||[]).forEach(function(x){if(!x||x.label==null)return;var href=x.href&&safe(x.href)?x.href:'';
        h+='<li class="pb-cmd__item"'+(x.action!=null?' data-cmd="'+pbEsc(x.action)+'"':'')+(href?' data-href="'+pbEsc(href)+'"':'')+(x.keywords?' data-keywords="'+pbEsc([].concat(x.keywords).join(' '))+'"':'')+'>'+
          (x.icon?'<span class="pb-icon pb-icon--'+pbEsc(String(x.icon).replace(/[^\w-]/g,''))+'"></span>':'')+'<span class="pb-cmd__label">'+pbEsc(x.label)+'</span>'+(x.hint?'<span class="pb-cmd__hint">'+pbEsc(x.hint)+'</span>':'')+'</li>';});});
    if(h){list.insertAdjacentHTML('beforeend',h);pbStyled(list);}all().forEach(prep);render();}
  function score(l,q){l=l.toLowerCase();var i=l.indexOf(q);if(i>=0)return 100-i;var j=0;for(var c=0;c<l.length&&j<q.length;c++)if(l[c]===q[j])j++;return j===q.length?10:-1;}
  var keys=pbListKeys(list,{mode:'active',input:inp,items:vis,homeEnd:function(){return nav;},idPrefix:'pb-cmd',onMove:function(it){all().forEach(function(x){x.setAttribute('aria-selected',x===it?'true':'false');});}});
  function render(){var q=inp.value.trim().toLowerCase();all().forEach(function(it){var kw=(it.dataset.keywords||'').toLowerCase(),s=q?score(it.dataset.label,q)+(kw.indexOf(q)>=0?5:0):1;if(q&&s<5&&kw.indexOf(q)>=0)s=5;it.hidden=s<0;
      var lab=it.querySelector('.pb-cmd__label');if(lab)lab.innerHTML=pbMark(it.dataset.label,q&&it.dataset.label.toLowerCase().indexOf(q)>=0?q:'');});
    list.querySelectorAll('.pb-cmd__group').forEach(function(g){var n=g.nextElementSibling,any=false;while(n&&!n.classList.contains('pb-cmd__group')){if(!n.hidden)any=true;n=n.nextElementSibling;}g.hidden=!any;});
    var v=vis();if(empty)empty.hidden=v.length>0;inp.setAttribute('aria-expanded',v.length>0);if(v.length)keys.move(0);else keys.clear();}
  function run(it){var d={command:it.dataset.cmd||it.dataset.label,label:it.dataset.label,href:it.dataset.href||null,item:it};dlg.close();if(pbEmit(dlg,'pb:command',d,true)&&d.href)location.assign(d.href);}
  function load(){var src=dlg.getAttribute('data-cmd-src');if(loaded||!src)return;loaded=true;list.setAttribute('aria-busy','true');
    fetch(src,{credentials:'same-origin',headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error('palette '+r.status);return r.json();}).then(add,function(){loaded=false;}).then(function(){list.removeAttribute('aria-busy');});}
  function reset(){inp.value='';nav=false;render();inp.focus();load();}
  inp.addEventListener('input',function(){nav=false;render();});
  inp.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp')nav=true;else if(e.key==='Enter'){var v=vis(),i=keys.index();if(v[i]){e.preventDefault();run(v[i]);}}},true);
  list.addEventListener('mousemove',function(e){var it=e.target.closest('.pb-cmd__item');if(!it||it.hasAttribute('data-active'))return;keys.move(vis().indexOf(it));});
  list.addEventListener('click',function(e){var it=e.target.closest('.pb-cmd__item');if(it)run(it);});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});
  dlg.addEventListener('pb:show',reset);
  dlg.pbOpen=function(){if(!dlg.open)dlg.showModal();dlg.dispatchEvent(new CustomEvent('pb:show',{detail:{opener:null}}));};
  dlg.pbAdd=add;
  if(!window.__pbCmdK){window.__pbCmdK=dlg;document.addEventListener('keydown',function(e){var d=window.__pbCmdK;if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')&&d&&!d.open&&d.isConnected){e.preventDefault();d.pbOpen();}});}
  var js=dlg.querySelector('script[type="application/json"]');all().forEach(prep);if(js){try{add(JSON.parse(js.textContent));}catch(e){console.error('[patchbay] palette JSON',e);}}render();}
/* Context menu: [data-contextmenu=id] opens the menu at the pointer, or under the focus with the Menu key or Shift+F10. One menu can serve many zones. */
function pbContext(zone){var m=document.getElementById(zone.dataset.contextmenu);if(!m)return;
  function close(){if(m.matches(':popover-open'))m.hidePopover();}
  if(!m.__pbCtx){m.__pbCtx=true;m.setAttribute('popover','manual');pbListKeys(m,{selector:'[role^=menuitem],.pb-menu__item',typeahead:true});
    m.addEventListener('toggle',function(e){if(e.newState==='closed'&&m.__pbZone)m.__pbZone.removeAttribute('data-ctx-open');});
    m.addEventListener('click',function(e){if(e.target.closest('.pb-menu__item')){m.hidePopover();if(m.__pbZone)m.__pbZone.focus();}});
    m.addEventListener('keydown',function(e){if(e.key==='Tab'){close();if(m.__pbZone)m.__pbZone.focus();}});}
  function mine(){return m.__pbZone===zone&&m.matches(':popover-open');}
  pbOnDoc('pointerdown',zone,function(e){if(mine()&&!m.contains(e.target))close();});
  pbOnDoc('keydown',zone,function(e){if(e.key==='Escape'&&mine()){close();zone.focus();}});
  pbOnDoc('scroll',zone,function(e){if(mine()&&!(e.target.nodeType===1&&m.contains(e.target)))close();});pbOnDoc('resize',zone,function(){if(mine())close();});
  function open(x,y){close();m.__pbZone=zone;zone.setAttribute('data-ctx-open','');m.showPopover();pbPlace(zone,m,{rect:{left:x,right:x,top:y,bottom:y,width:0,height:0},gap:2});var f=m.__pbKeys.items()[0];if(f)f.focus();}
  zone.addEventListener('contextmenu',function(e){e.preventDefault();open(e.clientX,e.clientY);});
  zone.addEventListener('keydown',function(e){if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();var r=(document.activeElement||zone).getBoundingClientRect();open(r.left+12,r.bottom);}});}
function pbLbKind(a){var k=a.dataset.kind,h=a.getAttribute('href')||'';return k||(/\.(mp4|webm|mov|m4v|ogv)([?#]|$)/i.test(h)?'video':/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)([?#]|$)/i.test(h)?'audio':'image');}
function pbLightbox(gal){var I=function(n){return '<span class="pb-icon pb-icon--'+n+'"></span>'},d=document.createElement('dialog'),idx=0,sx=null,links=[],opener=null;
  /* Members are read when the viewer opens, so tiles can be added, removed or reordered without binding again. */
  function members(){var sel=gal.dataset.imageviewer||(gal.querySelector('a[data-imageviewer-item]')?'a[data-imageviewer-item]':'a[href]');return [].slice.call(gal.querySelectorAll(sel));}
  d.className='pb-lightbox';d.setAttribute('aria-label','Image viewer');
  d.innerHTML='<div class="pb-lightbox__bar"><span class="pb-lightbox__count"></span><span class="pb-lightbox__name"></span><button type="button" class="pb-player__btn" data-zoom aria-label="Zoom" aria-pressed="false" title="Zoom (Z)">'+I('zoom-in')+'</button><a class="pb-player__btn" data-dl aria-label="Download" download>'+I('download')+'</a><button type="button" class="pb-player__btn" data-close aria-label="Close" title="Close (Esc)">'+I('close')+'</button></div>'+
    '<div class="pb-lightbox__stage"><button type="button" class="pb-lightbox__nav pb-lightbox__nav--prev" aria-label="Previous">'+I('chevron-right pb-icon--flip')+'</button><img alt=""><button type="button" class="pb-lightbox__nav pb-lightbox__nav--next" aria-label="Next">'+I('chevron-right')+'</button></div>'+
    '<p class="pb-lightbox__caption"></p><div class="pb-lightbox__thumbs"></div>';
  gal.after(d);var img=d.querySelector('.pb-lightbox__stage img'),q=function(s){return d.querySelector(s)},thumbs=q('.pb-lightbox__thumbs');
  function drawThumbs(){thumbs.innerHTML=links.map(function(a,i){var t=a.querySelector('img'),k=pbLbKind(a);return '<button type="button" data-k="'+i+'" aria-label="'+(k==='image'?'Image':'Item')+' '+(i+1)+'">'+(t||k==='image'?'<img src="'+pbEsc(t?t.src:a.href)+'" alt="">':I(k==='audio'?'volume':'play'))+'</button>'}).join('');}
  var media=null;function unmedia(){if(media){var m=media.querySelector('video,audio');if(m)m.pause();media.remove();media=null;}}
  function show(i){if(!links.length)return;idx=(i+links.length)%links.length;var a=links[idx],t=a.querySelector('img'),k=pbLbKind(a);unmedia();img.hidden=k!=='image';q('[data-zoom]').disabled=k!=='image';
    if(k==='image'){img.src=a.href;img.alt=(t&&t.alt)||'';}else{img.removeAttribute('src');media=document.createElement('figure');media.className='pb-player'+(k==='audio'?' pb-player--audio':'');media.setAttribute('data-player','');media.setAttribute('aria-label',a.dataset.name||a.href.split('/').pop());
      var m=document.createElement(k);m.src=a.href;m.preload='metadata';if(k==='video'){m.playsInline=true;if(a.dataset.poster)m.poster=a.dataset.poster;}media.appendChild(m);img.after(media);pbInit(media);}
    q('.pb-lightbox__count').textContent=(idx+1)+' / '+links.length;q('.pb-lightbox__name').textContent=a.dataset.name||a.href.split('/').pop();
    q('.pb-lightbox__caption').textContent=a.dataset.caption||'';q('.pb-lightbox__caption').hidden=!a.dataset.caption;q('[data-dl]').href=a.href;zoom(false);
    thumbs.querySelectorAll('button').forEach(function(b,k){b.setAttribute('aria-current',k===idx);if(k===idx)b.scrollIntoView({block:'nearest',inline:'center'});});
    q('.pb-lightbox__nav--prev').disabled=links.length<2;q('.pb-lightbox__nav--next').disabled=links.length<2;}
  function zoom(z){if(img.hidden)z=false;z=z==null?!d.hasAttribute('data-zoom'):z;z?d.setAttribute('data-zoom',''):d.removeAttribute('data-zoom');q('[data-zoom]').setAttribute('aria-pressed',z);q('[data-zoom]').innerHTML=I(z?'zoom-out':'zoom-in');}
  function open(a){links=members();var i=links.indexOf(a);if(i<0)return;opener=a;drawThumbs();show(i);if(!d.open)d.showModal();q('[data-close]').focus();}
  gal.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(!a||!gal.contains(a)||e.defaultPrevented)return;if(members().indexOf(a)<0)return;if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    e.preventDefault();open(a);});
  gal.pbOpen=function(i){var l=members();if(l[i||0])open(l[i||0]);};
  q('.pb-lightbox__nav--prev').addEventListener('click',function(){show(idx-1)});q('.pb-lightbox__nav--next').addEventListener('click',function(){show(idx+1)});
  q('[data-close]').addEventListener('click',function(){d.close()});q('[data-zoom]').addEventListener('click',function(){zoom()});img.addEventListener('click',function(){zoom()});
  thumbs.addEventListener('click',function(e){var b=e.target.closest('[data-k]');if(b)show(+b.dataset.k);});
  d.addEventListener('keydown',function(e){if(e.target.closest('.pb-player'))return;if(e.key==='ArrowRight')show(idx+1);else if(e.key==='ArrowLeft')show(idx-1);else if(e.key==='Home')show(0);else if(e.key==='End')show(links.length-1);else if(e.key==='z'||e.key==='Z')zoom();else return;e.preventDefault();});
  /* Give focus back to the opener only if nothing else took it after the dialog closed. */
  d.addEventListener('close',function(){unmedia();var f=document.activeElement;if(opener&&opener.isConnected&&(!f||f===document.body||f===d||d.contains(f)))opener.focus();});
  var st=q('.pb-lightbox__stage');st.addEventListener('pointerdown',function(e){sx=e.clientX});st.addEventListener('pointerup',function(e){if(sx!=null&&!d.hasAttribute('data-zoom')&&Math.abs(e.clientX-sx)>50)show(idx+(e.clientX<sx?1:-1));sx=null;});}
function pbAvatar(el){var n=el.dataset.name||'',p=n.trim().split(/[\s._@-]+/).filter(Boolean),ini=p.length>1?p[0][0]+p[1][0]:(p[0]||'?').slice(0,2),h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;
  if(!el.querySelector('img'))el.textContent=ini.toLowerCase();if(!el.hasAttribute('data-c'))el.dataset.c=h%4;el.setAttribute('role','img');el.setAttribute('aria-label',n||'user');if(!el.title)el.title=n;}
function pbPages(cur,total){var s=new Set([1,total,cur,cur-1,cur+1]);if(cur<=3){s.add(2);s.add(3);s.add(4);}if(cur>=total-2){s.add(total-1);s.add(total-2);s.add(total-3);}var a=Array.from(s).filter(function(x){return x>=1&&x<=total}).sort(function(x,y){return x-y}),o=[];a.forEach(function(x,i){if(i&&x-a[i-1]>1)o.push(0);o.push(x)});return o;}
function pbPager(nav){var total=+nav.dataset.total,size=+(nav.dataset.size||20),count=+(nav.dataset.items||0),ul=nav.querySelector('.pb-pager__pages'),info=nav.querySelector('.pb-pager__info'),I=function(n){return '<span class="pb-icon pb-icon--'+n+'"></span>'};
  function go(p){p=Math.max(1,Math.min(total,p));nav.dataset.page=p;var h='<li><button type="button" class="pb-pager__page" data-p="'+(p-1)+'" aria-label="Previous page"'+(p===1?' disabled':'')+'>'+I('chevron-right pb-icon--flip')+'</button></li>';
    pbPages(p,total).forEach(function(x){h+=x?'<li><button type="button" class="pb-pager__page" data-p="'+x+'"'+(x===p?' aria-current="page"':'')+' aria-label="Page '+x+'">'+x+'</button></li>':'<li class="pb-pager__gap" aria-hidden="true">…</li>';});
    h+='<li><button type="button" class="pb-pager__page" data-p="'+(p+1)+'" aria-label="Next page"'+(p===total?' disabled':'')+'>'+I('chevron-right')+'</button></li>';ul.innerHTML=h;
    if(info&&count)info.textContent=((p-1)*size+1)+'–'+Math.min(count,p*size)+' of '+count;pbEmit(nav,'pb:page',p);}
  ul.addEventListener('click',function(e){var b=e.target.closest('[data-p]');if(b&&!b.disabled){go(+b.dataset.p);var c=ul.querySelector('[aria-current]');if(c)c.focus();}});go(+(nav.dataset.page||1));}
/* form[data-validate]: on submit, each invalid control gets aria-invalid, its .pb-field data-invalid, and a .pb-field__error (data-error or the browser's
   message, escaped) joined to its aria-describedby; an optional .pb-errsum lists them as links; focus moves to the first invalid field
   (data-validate="summary" focuses the summary instead). The submit is prevented and a cancelable pb:invalid {fields, submitter} fires first:
   cancel it to show errors your own way. Other submit listeners still run; the event carries e.pbInvalid (the invalid controls, [] when valid). */
function pbValidate(form){var sum=form.querySelector('.pb-errsum');form.setAttribute('novalidate','');
  function ctrls(){return [].filter.call(form.elements,function(c){return c.willValidate&&/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName);});}
  function msg(c){return c.dataset.error||c.validationMessage;}
  function desc(c,add,rm){var d=(c.getAttribute('aria-describedby')||'').split(/\s+/).filter(function(x){return x&&x!==rm&&x!==add;});if(add)d.push(add);d.length?c.setAttribute('aria-describedby',d.join(' ')):c.removeAttribute('aria-describedby');}
  function clear(c){var f=c.closest('.pb-field');c.removeAttribute('aria-invalid');if(!f)return;var e=f.querySelector('.pb-field__error');if(e)desc(c,null,e.id);
    if(!f.querySelector('[aria-invalid="true"]')){if(e)e.remove();f.removeAttribute('data-invalid');}}
  function mark(c){var f=c.closest('.pb-field');c.setAttribute('aria-invalid','true');if(!f)return;f.setAttribute('data-invalid','');var e=f.querySelector('.pb-field__error');
    if(!e){e=document.createElement('span');e.className='pb-field__error';e.id=c.id+'-error';f.appendChild(e);}
    e.innerHTML='<span class="pb-icon pb-icon--status-down pb-icon--16" aria-hidden="true"></span>'+pbEsc(msg(c));desc(c,e.id);}
  form.addEventListener('submit',function(e){var bad=[],radios={};
    ctrls().forEach(function(c){if(c.checkValidity()){clear(c);return;}if(c.type==='radio'){if(radios[c.name])return;radios[c.name]=1;}if(!c.id)c.id=pbId('pb-field');bad.push(c);});
    e.pbInvalid=bad;if(!bad.length){if(sum)sum.hidden=true;return;}
    e.preventDefault();if(!pbEmit(form,'pb:invalid',{fields:bad,submitter:e.submitter||null},true))return;
    bad.forEach(mark);
    if(sum){var ul=sum.querySelector('ul');if(ul)ul.innerHTML=bad.map(function(c){return '<li><a href="#'+pbEsc(c.id)+'">'+pbEsc(msg(c))+'</a></li>';}).join('');sum.hidden=false;}
    (form.getAttribute('data-validate')==='summary'&&sum?sum:bad[0]).focus();},true);
  function recheck(e){var c=e.target;if(c&&c.getAttribute&&c.getAttribute('aria-invalid')==='true'&&c.checkValidity())clear(c);}
  form.addEventListener('input',recheck);form.addEventListener('change',recheck);
  if(sum)sum.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var f=document.getElementById(a.getAttribute('href').slice(1));if(f){e.preventDefault();f.focus();f.scrollIntoView({block:'center'});}});}
var pbRelSet=new Set(),pbRelTimer=0;
function pbRelUp(t){var rtf=pbRelUp.f||(pbRelUp.f=new Intl.RelativeTimeFormat(undefined,{numeric:'auto'})),U=[['year',31536e6],['month',2592e6],['week',6048e5],['day',864e5],['hour',36e5],['minute',6e4],['second',1e3]];
  var d=new Date(t.getAttribute('datetime')),diff=d-Date.now(),a=Math.abs(diff);
  for(var i=0;i<U.length;i++){if(a>=U[i][1]||U[i][0]==='second'){t.textContent=a<45e3?'just now':rtf.format(Math.round(diff/U[i][1]),U[i][0]);break;}}
  if(!t.title)t.title=d.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});}
function pbRelTimeEl(t){pbRelUp(t);pbRelSet.add(t);if(!pbRelTimer)pbRelTimer=setInterval(function(){pbRelSet.forEach(function(x){if(!x.isConnected)pbRelSet.delete(x);else pbRelUp(x);});},30000);}
function pbRelTime(root){pbInit(root||document,{only:['reltime']});}
function pbMidTrunc(el){var t=el.dataset.text||el.textContent,k=+(el.dataset.keep||8);el.title=t;el.innerHTML='';var a=document.createElement('span'),b=document.createElement('span');a.textContent=t.slice(0,-k);b.textContent=t.slice(-k);el.append(a,b);}
function pbClampToggle(b){var el=document.getElementById(b.getAttribute('aria-controls')),cls=[].filter.call(el.classList,function(c){return /^pb-clamp-/.test(c)})[0];if(!cls)return;
  function fits(){return el.scrollHeight<=el.clientHeight+1;}if(fits()){b.hidden=true;return;}
  b.addEventListener('click',function(){var o=el.classList.toggle(cls);b.textContent=o?'Show more':'Show less';b.setAttribute('aria-expanded',!o);});}
function pbSplit(sp){var h=sp.querySelector('.pb-split__handle'),vert=sp.classList.contains('pb-split--vertical'),min=+(sp.dataset.min||15),max=+(sp.dataset.max||85),key=sp.dataset.key,v=parseFloat(sp.style.getPropertyValue('--pb-split'))||+(sp.dataset.start||40);
  try{if(key&&localStorage.getItem('pb-split-'+key))v=+localStorage.getItem('pb-split-'+key)}catch(e){}
  h.setAttribute('role','separator');h.setAttribute('aria-orientation',vert?'horizontal':'vertical');h.setAttribute('aria-valuemin',min);h.setAttribute('aria-valuemax',max);h.tabIndex=0;
  function set(x){v=Math.round(Math.max(min,Math.min(max,x))*10)/10;sp.style.setProperty('--pb-split',v+'%');h.setAttribute('aria-valuenow',Math.round(v));try{if(key)localStorage.setItem('pb-split-'+key,v)}catch(e){}}
  h.addEventListener('pointerdown',function(e){e.preventDefault();h.setPointerCapture(e.pointerId);sp.setAttribute('data-dragging','');var r=sp.getBoundingClientRect();
    function mv(ev){set(vert?(ev.clientY-r.top)/r.height*100:(ev.clientX-r.left)/r.width*100);}
    function up(){sp.removeAttribute('data-dragging');h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);}
    h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);});
  h.addEventListener('keydown',function(e){var s=e.shiftKey?10:2,k=e.key;if(k===(vert?'ArrowUp':'ArrowLeft'))set(v-s);else if(k===(vert?'ArrowDown':'ArrowRight'))set(v+s);else if(k==='Home')set(min);else if(k==='End')set(max);else if(k==='Enter')set(+(sp.dataset.start||40));else return;e.preventDefault();});
  h.addEventListener('dblclick',function(){set(+(sp.dataset.start||40))});set(v);}
/* Site header: dropdowns ([aria-controls] on .pb-sitenav__link), phone menu ([data-site-menu]), scrolled state for .pb-sitehead--sticky. */
function pbSiteHead(h){var drops=Array.from(h.querySelectorAll('.pb-sitenav__link[aria-controls]')),tog=h.querySelector('[data-site-menu]');
  /* Phones fold the bar into the menu; give the menu its own copy of the theme switch so it stays reachable. */
  var ts=h.querySelector('.pb-sitehead__actions > [data-theme-switch]'),mob=h.querySelector('.pb-sitehead__mobile');if(ts&&mob&&!mob.querySelector('[data-theme-switch]')){var c=ts.cloneNode(true);c.querySelectorAll('input[name]').forEach(function(i){i.name+='-menu';});mob.appendChild(c);}
  function close(except){drops.forEach(function(b){if(b===except)return;b.setAttribute('aria-expanded','false');var p=document.getElementById(b.getAttribute('aria-controls'));if(p)p.hidden=true;});}
  drops.forEach(function(b){var p=document.getElementById(b.getAttribute('aria-controls'));if(!p)return;b.setAttribute('aria-expanded','false');p.hidden=true;
    b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')!=='true';close(b);b.setAttribute('aria-expanded',o);p.hidden=!o;if(o){var f=p.querySelector('a,button');if(f&&b.dataset.focus!=='no')setTimeout(function(){f.focus()},0);}});
    b.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();if(b.getAttribute('aria-expanded')!=='true')b.click();else{var f=p.querySelector('a,button');if(f)f.focus();}}});
    pbListKeys(p,{items:function(){return Array.from(p.querySelectorAll('a,button'));},typeahead:true});
    p.addEventListener('keydown',function(e){if(e.key==='Escape'){close();b.focus();}});
    p.addEventListener('focusout',function(e){if(!p.contains(e.relatedTarget)&&e.relatedTarget!==b)close();});});
  pbOnDoc('click',h,function(e){if(!h.contains(e.target))close();});
  pbOnDoc('keydown',h,function(e){if(e.key==='Escape'){var o=drops.filter(function(b){return b.getAttribute('aria-expanded')==='true'})[0];close();if(o)o.focus();if(h.hasAttribute('data-menu-open')){h.removeAttribute('data-menu-open');if(tog){tog.setAttribute('aria-expanded','false');tog.focus();}}}});
  if(tog)tog.addEventListener('click',function(){var o=!h.hasAttribute('data-menu-open');h.toggleAttribute('data-menu-open',o);tog.setAttribute('aria-expanded',o);tog.setAttribute('aria-label',o?'Close menu':'Open menu');tog.querySelector('.pb-icon').className='pb-icon pb-icon--'+(o?'close':'menu');});
  if(h.classList.contains('pb-sitehead--sticky')){var sc=h.parentElement;while(sc&&sc!==document.body){var ov=getComputedStyle(sc).overflowY;if(ov==='auto'||ov==='scroll')break;sc=sc.parentElement;}var tgt=sc&&sc!==document.body?sc:window;
    function up(){h.toggleAttribute('data-scrolled',(tgt===window?scrollY:tgt.scrollTop)>4);}if(tgt===window)pbOnDoc('scroll',h,up);else tgt.addEventListener('scroll',up,{passive:true});up();}}
