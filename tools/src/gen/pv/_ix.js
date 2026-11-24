/* Interaction libs: shared helpers (strings, pbFmt, pbGuardUnload, key labels), bulk selection, query filter, sortable, shortcut sheet, upload queue, virtual list, section nav. */
Object.assign(pbStrings,Object.assign({bulkSelected:'{n} selected',bulkAllMatching:'All {n} matching selected',bulkSelectMatching:'Select all {n} matching',bulkOnlyPage:'Only this page',
  upqUploading:'Uploading {i} of {n}',upqProcessingN:'Processing {p}',upqAndDone:' · {d} done',upqPaused:'Paused · {i} of {n}',upqFailedDone:'{f} failed, {d} uploaded',upqDone:'{d} uploaded',upqNone:'No uploads',upqAlsoFailed:' · {f} failed',upqOf:'{a} of {b}',
  upqRetry:'Retry {name}',upqCancel:'Cancel {name}',upqRemove:'Remove {name}',upqWaiting:'waiting',upqUploaded:'uploaded',upqProcessing:'processing…',upqPausedWord:'paused',upqCanceledWord:'canceled',upqFailedWord:'Failed',upqLeft:'{t} left',upqSec:'{n} s',upqMin:'{n} min',
  pauseAll:'Pause all',resumeAll:'Resume all',keysTitle:'Keyboard shortcuts',keysFind:'Find a shortcut',keysNone:'No shortcut matches.',keysGeneral:'shortcuts',keysThen:'then',sortReorder:'Reorder {name}',sortGrabbed:'{name} grabbed. Position {i} of {n}. Use arrow keys to move, Space to drop, Escape to cancel.',sortDropped:'{name} dropped at position {i} of {n}.',sortCanceled:'Reorder canceled.',sortMoved:'{name}, position {i} of {n}.'},pbStrings));
/* Fills {name} placeholders in a pbStrings entry: pbFmt(pbStrings.bulkSelected, {n: 3}). */
function pbFmt(s,o){return String(s).replace(/\{(\w+)\}/g,function(_,k){return o&&o[k]!=null?o[k]:'';});}
/* Apple platforms use ⌘ where others use Ctrl: pbModLabel() is the label for the "mod" key. */
function pbIsMac(){var p=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'';return /Mac|iPhone|iPad|iPod/i.test(p);}
function pbModLabel(){return pbIsMac()?'⌘':'Ctrl+';}
/* One beforeunload listener for every guard. pbGuardUnload(owner, test): test() returns true while leaving would lose work. An entry drops out
   once owner has left the DOM; the call returns a function that removes it sooner. */
var pbGuards=[],pbGuardOn=false;
function pbGuardUnload(owner,test){var g={owner:owner,test:test,seen:!owner||owner.isConnected};pbGuards.push(g);
  if(!pbGuardOn){pbGuardOn=true;window.addEventListener('beforeunload',function(e){var hit=false;
    pbGuards=pbGuards.filter(function(x){if(!x.owner)return true;if(x.owner.isConnected){x.seen=true;return true;}return !x.seen;});
    pbGuards.forEach(function(x){try{if(x.test())hit=true;}catch(err){console.error('[patchbay] guard',err);}});
    if(hit){e.preventDefault();e.returnValue='';}});}
  return function(){var i=pbGuards.indexOf(g);if(i>=0)pbGuards.splice(i,1);};}

/* Bulk bar: scope [data-bulk] holds row checkboxes (.pb-check[data-row]) in a table, list or grid, an optional [data-all] and the .pb-bulkbar.
   A row is the closest [data-bulk-item], tr, .pb-item or li. Shift+click (or Shift+Space) on a box selects the range from the last one clicked; Space on a focused
   [data-bulk-item] toggles it. data-bulk-total="248" on the scope offers "Select all 248 matching" once every box on the page is checked:
   a [data-bulk-matching-field] hidden input (disabled until then) tells the server "all matching", [data-bulk-matching] / [data-bulk-matching-off] switch it.
   Fires pb:bulk {action, items, all, count, total} on a bar button, and pb:select {items, all, count} whenever the selection changes. */
function pbBulk(scope){var bar=scope.querySelector('.pb-bulkbar');if(!bar)return;var cnt=bar.querySelector('[data-bulk-count]'),all=scope.querySelector('[data-all]'),field=scope.querySelector('[data-bulk-matching-field]'),
  on=scope.querySelector('[data-bulk-matching]'),off=scope.querySelector('[data-bulk-matching-off]'),matching=false,anchor=null,ITEM='[data-bulk-item],tr,.pb-item,li';
  function boxes(){return Array.from(scope.querySelectorAll('.pb-check[data-row]')).filter(function(b){return !b.closest('[hidden]')});}
  function total(){return +scope.dataset.bulkTotal||0;}
  function picked(){return boxes().filter(function(b){return b.checked});}
  function rowOf(b){return b.closest(ITEM);}
  function sync(){var B=boxes(),n=B.filter(function(b){return b.checked}).length,full=n>0&&n===B.length,T=total();if(!full)matching=false;
    B.forEach(function(b){var r=rowOf(b);if(!r)return;r.toggleAttribute('data-selected',b.checked);if(r.matches('tr,[role=row],[role=option],[role=gridcell],[role=treeitem]'))r.setAttribute('aria-selected',b.checked);else r.removeAttribute('aria-selected');});
    if(all){all.checked=full;all.indeterminate=n>0&&!full;}
    bar.hidden=!n;scope.toggleAttribute('data-bulk-all',matching);
    if(cnt)cnt.textContent=matching?pbFmt(pbStrings.bulkAllMatching,{n:T}):pbFmt(pbStrings.bulkSelected,{n:n});
    if(on){on.hidden=!(full&&T>B.length&&!matching);on.textContent=pbFmt(pbStrings.bulkSelectMatching,{n:T});}
    if(off){off.hidden=!matching;off.textContent=pbStrings.bulkOnlyPage;}
    if(field)field.disabled=!matching;}
  function emit(){var P=picked();scope.dispatchEvent(new CustomEvent('pb:select',{bubbles:true,detail:{items:P.map(rowOf),all:matching,count:matching?total():P.length}}));}
  function clear(){boxes().forEach(function(x){x.checked=false});anchor=null;sync();emit();}
  scope.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.pb-check[data-row]');if(!b||!scope.contains(b))return;var last=anchor;anchor=b;
    if(e.shiftKey&&last&&last!==b){var L=boxes(),i=L.indexOf(last),j=L.indexOf(b);if(i>=0&&j>=0){L.slice(Math.min(i,j),Math.max(i,j)+1).forEach(function(x){if(!x.disabled)x.checked=b.checked;});
      var s=window.getSelection&&getSelection();if(s)s.removeAllRanges();sync();}}});
  scope.addEventListener('change',function(e){if(e.target===all){boxes().forEach(function(b){b.checked=all.checked});anchor=null;}else if(!e.target.matches('.pb-check[data-row]'))return;sync();emit();});
  scope.addEventListener('keydown',function(e){var it=e.target.closest&&e.target.closest('[data-bulk-item]');if(e.key===' '&&it&&e.target===it){var b=it.querySelector('.pb-check[data-row]');if(b){e.preventDefault();b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,shiftKey:e.shiftKey}));}}
    else if(e.key==='Escape'&&!bar.hidden)clear();});
  if(on)on.addEventListener('click',function(){matching=true;sync();emit();});
  if(off)off.addEventListener('click',function(){matching=false;sync();emit();});
  bar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-bulk-clear')){clear();var f=boxes()[0];if(f)f.focus();return;}
    if(b.dataset.bulkAction){var P=picked();scope.dispatchEvent(new CustomEvent('pb:bulk',{bubbles:true,detail:{action:b.dataset.bulkAction,items:P.map(rowOf),all:matching,count:matching?total():P.length,total:total()}}));}});
  scope.pbBulkSync=sync;sync();}

/* Query filter: schema {keys:[{key,desc,type:'enum'|'number'|'text',values:[]}]}. Tokens key:value, -key:value, key>n, key<n, free text. Fires pb:change with tokens. */
function pbQuery(el){var S=JSON.parse((el.querySelector('script[type="application/json"]')||{}).textContent||'{"keys":[]}'),box=el.querySelector('.pb-qf__box'),inp=box.querySelector('input'),menu=el.querySelector('.pb-qf__menu'),toks=[],opts=[],act=0,K={};S.keys.forEach(function(k){K[k.key]=k;});
  menu.id=menu.id||pbId('qf');inp.setAttribute('role','combobox');inp.setAttribute('aria-controls',menu.id);inp.setAttribute('aria-expanded','false');inp.setAttribute('autocomplete','off');menu.setAttribute('role','listbox');
  function parse(t){t=t.trim();if(!t)return null;var m=t.match(/^(-?)([a-z][\w.-]*)(:|>=|<=|>|<)(.+)$/i);if(m&&K[m[2].toLowerCase()]){var k=K[m[2].toLowerCase()],v=m[4].replace(/^"|"$/g,''),bad=(k.type==='number'&&isNaN(parseFloat(v)))||(k.type==='enum'&&k.values&&!k.values.some(function(x){return x.toLowerCase()===v.toLowerCase()||(v.indexOf('*')>=0&&new RegExp('^'+v.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$','i').test(x))}));return {key:k.key,op:m[3],value:v,not:!!m[1],invalid:bad};}return {text:t.replace(/^"|"$/g,'')};}
  function str(t){return t.text!=null?t.text:(t.not?'-':'')+t.key+t.op+t.value;}
  function chips(){box.querySelectorAll('.pb-qf__chip').forEach(function(c){c.remove()});toks.forEach(function(t,i){var c=document.createElement('span');c.className='pb-qf__chip';if(t.not)c.setAttribute('data-not','');if(t.text!=null)c.setAttribute('data-text','');if(t.invalid){c.setAttribute('data-invalid','');c.title='No '+t.key+' called “'+t.value+'”';}
    c.innerHTML='<button type="button" aria-label="Edit '+pbEsc(str(t))+'">'+(t.text!=null?'<span class="pb-qf__val">“'+pbEsc(t.text)+'”</span>':'<span class="pb-qf__key">'+pbEsc(t.key)+'</span>'+(t.op!==':'?'<span class="pb-qf__op">'+pbEsc(t.op)+'</span>':'')+'<span class="pb-qf__val">'+pbEsc(t.value)+'</span>')+'</button><button type="button" class="pb-qf__x" aria-label="Remove '+pbEsc(str(t))+'"><span class="pb-icon pb-icon--close"></span></button>',pbStyled(c);
    c.querySelector('.pb-qf__x').addEventListener('click',function(e){e.stopPropagation();toks.splice(i,1);chips();emit();inp.focus();});
    c.firstChild.addEventListener('click',function(e){e.stopPropagation();toks.splice(i,1);chips();inp.value=str(t);inp.focus();suggest();emit();});
    box.insertBefore(c,inp);});}
  function emit(){el.dispatchEvent(new CustomEvent('pb:change',{bubbles:true,detail:toks.slice()}));}
  function commit(t){var p=parse(t);if(p){toks.push(p);chips();emit();}inp.value='';suggest();}
  function hlm(s,q){var i=s.toLowerCase().indexOf(q.toLowerCase());return i<0||!q?pbEsc(s):pbEsc(s.slice(0,i))+'<mark>'+pbEsc(s.slice(i,i+q.length))+'</mark>'+pbEsc(s.slice(i+q.length));}
  function suggest(){var v=inp.value,m=v.match(/^(-?)([a-z][\w.-]*)(:|>=|<=|>|<)(.*)$/i),h='';opts=[];act=-1;
    if(m&&K[m[2].toLowerCase()]){var k=K[m[2].toLowerCase()];if(k.values){var vs=k.values.filter(function(x){return x.toLowerCase().indexOf(m[4].toLowerCase())>=0});if(vs.length){h+='<li class="pb-qf__head" role="presentation">'+pbEsc(k.key)+'</li>';vs.slice(0,12).forEach(function(x){opts.push({fill:m[1]+k.key+m[3]+x,commit:true});h+='<li class="pb-qf__opt" role="option"><span>'+hlm(x,m[4])+'</span></li>';});}}
      else if(k.type==='number'){h+='<li class="pb-qf__head" role="presentation">'+pbEsc(k.key+' '+(k.desc||''))+'</li>';if(m[4]){opts.push({fill:v,commit:true});h+='<li class="pb-qf__opt" role="option"><span>'+pbEsc(v)+'</span><small>press Enter</small></li>';}}}
    else{var q=v.replace(/^-/,'');var ks=S.keys.filter(function(k){return !q||k.key.indexOf(q.toLowerCase())===0||(k.desc||'').toLowerCase().indexOf(q.toLowerCase())>=0});
      if(ks.length){h+='<li class="pb-qf__head" role="presentation">filter by</li>';ks.forEach(function(k){var op=k.type==='number'?'>':':';opts.push({fill:(v[0]==='-'?'-':'')+k.key+op,commit:false});h+='<li class="pb-qf__opt" role="option"><span>'+hlm(k.key,q)+'<span class="pb-muted">'+op+'</span></span><small>'+pbEsc(k.desc||'')+'</small></li>';});}
      if(q){opts.push({fill:v,commit:true});h+='<li class="pb-qf__head" role="presentation">text</li><li class="pb-qf__opt" role="option"><span>“'+pbEsc(v)+'”</span><small>search anywhere</small></li>';}}
    menu.innerHTML=h,pbStyled(menu);var show=document.activeElement===inp&&opts.length>0;menu.hidden=!show;inp.setAttribute('aria-expanded',show);mark();}
  function mark(){var L=menu.querySelectorAll('.pb-qf__opt');L.forEach(function(o,i){o.id=menu.id+'-'+i;o.setAttribute('aria-selected',i===act);});if(L[act]){inp.setAttribute('aria-activedescendant',L[act].id);L[act].scrollIntoView({block:'nearest'});}else inp.removeAttribute('aria-activedescendant');}
  function pick(i){var o=opts[i];if(!o)return;if(o.commit)commit(o.fill);else{inp.value=o.fill;suggest();}inp.focus();}
  inp.addEventListener('input',suggest);inp.addEventListener('focus',suggest);
  inp.addEventListener('blur',function(){setTimeout(function(){if(document.activeElement!==inp){menu.hidden=true;inp.setAttribute('aria-expanded','false');}},120);});
  function close(){menu.hidden=true;act=-1;inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant');}
  inp.addEventListener('keydown',function(e){var L=opts.length;if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!L)return;e.preventDefault();if(menu.hidden){suggest();return;}act=e.key==='ArrowDown'?(act+1)%L:(act<0?L-1:(act-1+L)%L);mark();}
    else if(e.key==='Enter'){if(!menu.hidden&&act>=0){e.preventDefault();pick(act);}else if(inp.value.trim()){e.preventDefault();commit(inp.value);}}
    else if(e.key==='Tab'){if(inp.value.trim()&&!/(:|>=|<=|>|<)$/.test(inp.value.trim())&&!e.shiftKey)commit(inp.value);close();}
    else if(e.key==='Backspace'&&!inp.value&&toks.length){var t=toks.pop();chips();inp.value=str(t);e.preventDefault();suggest();emit();}
    else if(e.key==='Escape'&&!menu.hidden){e.preventDefault();e.stopPropagation();close();}});
  menu.addEventListener('mousedown',function(e){e.preventDefault();});
  menu.addEventListener('click',function(e){var o=e.target.closest('.pb-qf__opt');if(o)pick(Array.from(menu.querySelectorAll('.pb-qf__opt')).indexOf(o));});
  box.addEventListener('click',function(e){if(e.target===box)inp.focus();});
  var c=el.querySelector('[data-qf-clear]');if(c)c.addEventListener('click',function(){toks=[];chips();emit();inp.focus();});
  el.pbSet=function(s){toks=[];(s.match(/-?[a-z][\w.-]*(?::|>=|<=|>|<)(?:"[^"]*"|\S+)|"[^"]*"|\S+/gi)||[]).forEach(function(t){var p=parse(t);if(p)toks.push(p)});chips();emit();};
  el.pbTokens=function(){return toks.slice();};
  el.pbMatch=function(get){return function(row){return toks.every(function(t){if(t.invalid)return true;var r;if(t.text!=null){r=get(row,null).toLowerCase().indexOf(t.text.toLowerCase())>=0;return r;}var v=get(row,t.key);
      if(t.op===':'){var re=new RegExp('^'+t.value.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$','i');r=v!=null&&re.test(String(v));}else{var a=parseFloat(v),b=parseFloat(t.value);r=t.op==='>'?a>b:t.op==='<'?a<b:t.op==='>='?a>=b:a<=b;}return t.not?!r:r;});};};
  if(el.dataset.value)el.pbSet(el.dataset.value);}

/* Sortable: drag .pb-sort__handle, or focus it and press Space, arrows, Space (Esc cancels). Fires pb:reorder with the ids. */
function pbSortable(list){var live=document.createElement('div');live.className='pb-sr';live.setAttribute('aria-live','assertive');list.after(live);var grid=list.classList.contains('pb-sortable--grid')||list.classList.contains('pb-sortable--tiles');
  function items(){return Array.from(list.querySelectorAll(':scope > .pb-sort__item'));}
  function label(it){return (it.querySelector('[data-sort-label]')||it).textContent.trim();}
  function num(){items().forEach(function(it,i){var n=it.querySelector('.pb-sort__num');if(n)n.textContent=i+1;});}
  function emit(){num();list.dispatchEvent(new CustomEvent('pb:reorder',{bubbles:true,detail:items().map(function(i){return i.dataset.id})}));}
  items().forEach(function(it){var h=it.querySelector('.pb-sort__handle');if(h){h.setAttribute('aria-label',pbFmt(pbStrings.sortReorder,{name:label(it)}));h.setAttribute('aria-describedby','');}});
  // keyboard
  var grabbed=null,orig=0;
  list.addEventListener('keydown',function(e){var h=e.target.closest('.pb-sort__handle');if(!h)return;var it=h.closest('.pb-sort__item'),I=items(),i=I.indexOf(it);
    if(e.key===' '||e.key==='Enter'){e.preventDefault();if(grabbed){grabbed.removeAttribute('data-grabbed');live.textContent=pbFmt(pbStrings.sortDropped,{name:label(grabbed),i:items().indexOf(grabbed)+1,n:I.length});grabbed=null;emit();}else{grabbed=it;orig=i;it.setAttribute('data-grabbed','');live.textContent=pbFmt(pbStrings.sortGrabbed,{name:label(it),i:i+1,n:I.length});}return;}
    if(!grabbed)return;var d={ArrowUp:-1,ArrowDown:1,ArrowLeft:grid?-1:0,ArrowRight:grid?1:0}[e.key];
    if(e.key==='Escape'){e.preventDefault();var ref=items().filter(function(x){return x!==grabbed})[orig];ref?list.insertBefore(grabbed,ref):list.appendChild(grabbed);grabbed.removeAttribute('data-grabbed');h.focus();live.textContent=pbStrings.sortCanceled;grabbed=null;num();return;}
    if(!d)return;e.preventDefault();if(grid&&(e.key==='ArrowUp'||e.key==='ArrowDown')){var cols=Math.max(1,Math.round(list.clientWidth/it.offsetWidth));d*=cols;}var j=Math.max(0,Math.min(I.length-1,i+d));if(j===i)return;
    if(j>i)I[j].after(it);else list.insertBefore(it,I[j]);h.focus();num();live.textContent=pbFmt(pbStrings.sortMoved,{name:label(it),i:j+1,n:I.length});});
  // pointer
  list.addEventListener('pointerdown',function(e){var h=e.target.closest('.pb-sort__handle');if(!h||e.button!==0)return;e.preventDefault();var it=h.closest('.pb-sort__item'),r=it.getBoundingClientRect(),lr=list.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top,ph=document.createElement('li');
    ph.className='pb-sort__ph';ph.style.height=r.height+'px';if(grid)ph.style.minHeight=r.height+'px';it.after(ph);
    it.setAttribute('data-dragging','');Object.assign(it.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:0});h.setPointerCapture(e.pointerId);
    function move(ev){it.style.left=(ev.clientX-ox)+'px';it.style.top=(ev.clientY-oy)+'px';var cx=ev.clientX,cy=ev.clientY,best=null,bd=1e9;
      items().forEach(function(o){if(o===it)return;var b=o.getBoundingClientRect(),dx=cx-(b.left+b.width/2),dy=cy-(b.top+b.height/2),dist=grid?dx*dx+dy*dy:Math.abs(dy);if(dist<bd){bd=dist;best=o;}});
      if(best){var b=best.getBoundingClientRect(),after=grid?(cy>b.bottom||(cy>b.top&&cx>b.left+b.width/2)):cy>b.top+b.height/2;if(after){if(best.nextElementSibling!==ph)best.after(ph);}else if(best.previousElementSibling!==ph)list.insertBefore(ph,best);}}
    function up(){h.removeEventListener('pointermove',move);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);list.insertBefore(it,ph);ph.remove();it.removeAttribute('data-dragging');['position','left','top','width','height','margin'].forEach(function(p){it.style[p]=''});h.focus();emit();}
    h.addEventListener('pointermove',move);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);});
  num();}

/* Shortcut sheet: dialog.pb-keys. Opens from any [data-pb-open="#id"] button and on ? (through pbShortcuts, which also lists the keys an app registers);
   the search box filters its rows and pb:show clears it. Its hand-written groups stay; registered shortcuts are added after them. */
function pbKeysSheet(dlg){var q=dlg.querySelector('input[type="search"]'),empty=dlg.querySelector('.pb-keys__empty');
  function filter(){var t=(q&&q.value||'').trim().toLowerCase(),any=false;dlg.querySelectorAll('.pb-keys__group').forEach(function(g){var n=0;g.querySelectorAll('dl > div').forEach(function(r){var ok=!t||r.textContent.toLowerCase().indexOf(t)>=0||(r.dataset.keywords||'').indexOf(t)>=0;r.hidden=!ok;if(ok)n++;});g.hidden=!n;if(n)any=true;});if(empty)empty.hidden=any;}
  if(q)q.addEventListener('input',filter);
  dlg.addEventListener('pb:show',function(){pbKeysRender(dlg);if(q)q.value='';filter();if(q)q.focus();});
  dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.closest('[data-close]'))dlg.close();});
  dlg.pbFilter=filter;dlg.pbOpen=function(){if(dlg.open)return;dlg.showModal();dlg.dispatchEvent(new CustomEvent('pb:show',{detail:{opener:null}}));};
  pbShortcuts({},{sheet:dlg});}

/* Upload queue: el.pbAdd({name,size}) returns an item {state, start(), progress(bytes, rate), process(), done(), fail(reason), remove()}; the app does the transfer.
   States: queued, uploading (with %), processing (the server is working on it), done, failed (with the reason), paused, canceled.
   Rows offer Cancel (until finished), Retry (failed or canceled) and Remove (finished); [data-upq-cancel-all] cancels everything still running.
   Fires pb:cancel, pb:retry, pb:remove (detail: the item), pb:pause and pb:resume; the app aborts, restarts or forgets the transfer. While anything is queued,
   uploading or processing, leaving the page asks first (pbGuardUnload). */
function pbFmtBytes(b){if(b<1024)return b+' B';var u=['KB','MB','GB','TB'],i=-1;do{b/=1024;i++;}while(b>=1024&&i<3);return (b<10?b.toFixed(1):Math.round(b))+' '+u[i];}
function pbUploadQueue(el){var C=(el.dataset.upqControls||'cancel pause').split(/[\s,]+/),can=C.indexOf('cancel')>=0,pau=C.indexOf('pause')>=0,list=el.querySelector('.pb-upq__list'),title=el.querySelector('.pb-upq__title'),tot=el.querySelector('.pb-upq__total span'),items=[],paused=false;
  var IC={uploading:'upload',queued:'clock',processing:'cpu',done:'status-ok',failed:'status-down',paused:'status-paused',canceled:'close'};
  function S(k,o){return pbFmt(pbStrings[k],o);}
  function btn(a,ic,l){return '<button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-a="'+a+'" aria-label="'+pbEsc(l)+'"><span class="pb-icon pb-icon--'+ic+'"></span></button>';}
  function pending(i){return i.state==='queued'||i.state==='uploading'||i.state==='processing'||i.state==='paused';}
  function draw(it){var s=it.state,p=it.size?Math.min(100,it.loaded/it.size*100):0,pc=Math.round(p),meta,bar=it.li.querySelector('.pb-upq__bar');
    if(s==='uploading'){var eta=it.rate?Math.max(0,(it.size-it.loaded)/it.rate):0;meta=pc+'% · '+pbFmtBytes(it.loaded)+' / '+pbFmtBytes(it.size)+(it.rate?' · '+pbFmtBytes(it.rate)+'/s · '+S('upqLeft',{t:eta<60?S('upqSec',{n:Math.ceil(eta)}):S('upqMin',{n:Math.ceil(eta/60)})}):'');}
    else if(s==='processing')meta=S('upqProcessing');else if(s==='done')meta=pbFmtBytes(it.size)+' · '+S('upqUploaded');else if(s==='failed')meta=it.msg||S('upqFailedWord');else if(s==='queued')meta=pbFmtBytes(it.size)+' · '+S('upqWaiting');
    else if(s==='paused')meta=pc+'% · '+pbFmtBytes(it.loaded)+' / '+pbFmtBytes(it.size)+' · '+S('upqPausedWord');else meta=S('upqCanceledWord');
    it.li.dataset.state=s;it.li.querySelector('.pb-icon').className='pb-icon pb-icon--'+IC[s]+'';it.li.querySelector('.pb-upq__txt').textContent=meta;bar.querySelector('span').style.setProperty('--p',(s==='processing'||s==='done'?100:p)+'%');
    if(s==='processing')bar.removeAttribute('aria-valuenow');else bar.setAttribute('aria-valuenow',s==='done'?100:pc);
    it.li.querySelector('.pb-upq__acts').innerHTML=s==='failed'||s==='canceled'?btn('retry','refresh',S('upqRetry',{name:it.name}))+btn('remove','close',S('upqRemove',{name:it.name})):s==='done'?btn('remove','close',S('upqRemove',{name:it.name})):can?btn('cancel','close',S('upqCancel',{name:it.name})):'';summary();}
  function summary(){var act=items.filter(function(i){return i.state!=='canceled'}),done=act.filter(function(i){return i.state==='done'}).length,fail=act.filter(function(i){return i.state==='failed'}).length,run=act.length-done-fail,size=act.reduce(function(a,i){return a+i.size},0),ld=act.reduce(function(a,i){return a+(i.state==='done'||i.state==='processing'?i.size:i.loaded)},0),pc=size?Math.round(ld/size*100):0;
    var proc=act.filter(function(i){return i.state==='processing'}).length,xfer=run-proc,
      main=xfer?S(paused?'upqPaused':'upqUploading',{i:Math.min(act.length,done+fail+proc+1),n:act.length}):proc?S('upqProcessingN',{p:proc})+(done?S('upqAndDone',{d:done}):''):fail?S('upqFailedDone',{f:fail,d:done}):done?S('upqDone',{d:done}):S('upqNone');
    title.textContent=main+(xfer&&size?' · '+pc+'%':'');var sm=document.createElement('small');sm.textContent=S('upqOf',{a:pbFmtBytes(ld),b:pbFmtBytes(size)})+(fail&&run?S('upqAlsoFailed',{f:fail}):'');title.appendChild(sm);
    if(tot){tot.style.setProperty('--p',pc+'%');var tb=tot.parentElement;tb.setAttribute('role','progressbar');tb.setAttribute('aria-label',title.firstChild.textContent);tb.setAttribute('aria-valuemin','0');tb.setAttribute('aria-valuemax','100');tb.setAttribute('aria-valuenow',pc);}
    el.hidden=!items.length;var pa=el.querySelector('[data-upq-pause]');if(pa){pa.hidden=!run||!pau;pa.textContent=paused?pbStrings.resumeAll:pbStrings.pauseAll;}var ca=el.querySelector('[data-upq-cancel-all]');if(ca)ca.hidden=!items.some(pending);}
  function fire(n,it){el.dispatchEvent(new CustomEvent('pb:'+n,{bubbles:true,detail:it}));}
  function cancel(it){if(!pending(it))return;it.state='canceled';draw(it);fire('cancel',it);}
  el.pbAdd=function(f){var it={id:f.id,name:f.name,size:f.size||0,loaded:0,rate:0,state:'queued',file:f.file},li=document.createElement('li');li.className='pb-upq__item';
    li.innerHTML='<span class="pb-icon"></span><span class="pb-upq__name" title="'+pbEsc(f.name)+'">'+pbEsc(f.name)+'</span><span class="pb-upq__acts"></span><span class="pb-upq__meta"><span class="pb-upq__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="'+pbEsc(f.name)+'"><span></span></span><span class="pb-upq__txt"></span></span>';it.li=li;list.appendChild(li);items.push(it);
    it.start=function(){it.state=paused?'paused':'uploading';draw(it);};it.progress=function(b,rate){if(it.state==='canceled'||it.state==='processing'||it.state==='done')return;it.loaded=b;it.rate=rate||it.rate;if(it.state!=='paused')it.state='uploading';draw(it);};
    it.process=function(){if(it.state==='canceled')return;it.loaded=it.size;it.state='processing';draw(it);};it.done=function(){if(it.state==='canceled')return;it.loaded=it.size;it.state='done';draw(it);};it.fail=function(m){if(it.state==='canceled')return;it.state='failed';it.msg=m;draw(it);};
    it.remove=function(){var n=li.nextElementSibling||li.previousElementSibling,had=li.contains(document.activeElement);li.remove();items.splice(items.indexOf(it),1);summary();if(had){var t=n&&n.querySelector('[data-a]');if(t)t.focus();else{el.tabIndex=-1;el.focus();}}};
    li.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a;if(a==='cancel')cancel(it);else if(a==='retry'){it.loaded=0;it.rate=0;it.msg='';it.state='queued';draw(it);fire('retry',it);}else if(a==='remove'){fire('remove',it);it.remove();}});
    draw(it);return it;};
  var tg=el.querySelector('[data-upq-toggle]');if(tg)tg.addEventListener('click',function(){var c=!el.hasAttribute('data-collapsed');el.toggleAttribute('data-collapsed',c);tg.setAttribute('aria-expanded',!c);});
  var cl=el.querySelector('[data-upq-clear]');if(cl)cl.addEventListener('click',function(){items.slice().forEach(function(i){if(i.state==='done'||i.state==='canceled'){fire('remove',i);i.li.remove();items.splice(items.indexOf(i),1);}});summary();});
  var ca=el.querySelector('[data-upq-cancel-all]');if(ca)ca.addEventListener('click',function(){items.filter(pending).forEach(cancel);});
  var pa=el.querySelector('[data-upq-pause]');if(pa)pa.addEventListener('click',function(){paused=!paused;items.forEach(function(i){if(i.state==='uploading'&&paused)i.state='paused';else if(i.state==='paused'&&!paused)i.state='uploading';draw(i);});fire(paused?'pause':'resume',null);});
  pbGuardUnload(el,function(){return items.some(function(i){return i.state==='queued'||i.state==='uploading'||i.state==='processing';});});
  el.pbPaused=function(){return paused;};el.pbItems=function(){return items;};el.pbActive=function(){return items.filter(pending).length;};summary();}

/* Virtual list: renders only visible rows. pbVirtual(el, {count, render(i) -> html}); row height from --rh (default 32). */
function pbVirtual(el,o){var rh=parseFloat(getComputedStyle(el).getPropertyValue('--rh'))||32,sp=document.createElement('div'),act=-1,raf=0,over=8;sp.className='pb-vlist__spacer';el.innerHTML='',pbStyled(el);el.appendChild(sp);el.tabIndex=0;el.setAttribute('role','listbox');var vid=el.id||(el.id=pbId('vl'));
  function draw(){raf=0;var n=o.count,top=el.scrollTop,h=el.clientHeight,a=Math.max(0,Math.floor(top/rh)-over),b=Math.min(n,Math.ceil((top+h)/rh)+over),html='';sp.style.height=n*rh+'px';
    for(var i=a;i<b;i++)html+='<div class="pb-vlist__row" role="option" id="'+vid+'-r'+i+'" aria-selected="'+(i===act)+'" aria-setsize="'+n+'" aria-posinset="'+(i+1)+'" data-style="top:'+i*rh+'px"'+(i===act?' data-active':'')+'>'+o.render(i)+'</div>';sp.innerHTML=html,pbStyled(sp);if(act>=a&&act<b)el.setAttribute('aria-activedescendant',vid+'-r'+act);else el.removeAttribute('aria-activedescendant');if(o.onRange)o.onRange(a,b);}
  function sched(){if(!raf)raf=requestAnimationFrame(draw);}
  el.addEventListener('scroll',sched);pbOnDoc('resize',el,sched);
  el.pbScrollTo=function(i,center){i=Math.max(0,Math.min(o.count-1,i));act=i;var y=i*rh;if(center)el.scrollTop=y-el.clientHeight/2+rh/2;else if(y<el.scrollTop)el.scrollTop=y;else if(y+rh>el.scrollTop+el.clientHeight)el.scrollTop=y+rh-el.clientHeight;draw();};
  el.addEventListener('keydown',function(e){var pg=Math.floor(el.clientHeight/rh),d={ArrowDown:1,ArrowUp:-1,PageDown:pg,PageUp:-pg}[e.key];if(e.key==='Home'){e.preventDefault();el.pbScrollTo(0);}else if(e.key==='End'){e.preventDefault();el.pbScrollTo(o.count-1);}else if(d){e.preventDefault();el.pbScrollTo((act<0?Math.floor(el.scrollTop/rh):act)+d);}else if(e.key==='Enter'&&act>=0){e.preventDefault();pick();}});
  function pick(){el.dispatchEvent(new CustomEvent('pb:select',{bubbles:true,detail:{index:act}}));}
  el.addEventListener('click',function(e){var r=e.target.closest('.pb-vlist__row');if(r){act=+r.getAttribute('aria-posinset')-1;draw();pick();}});
  el.pbSetCount=function(n){o.count=n;draw();};draw();}
/* Section nav: links to #ids mark the section in view with aria-current. Works inside a scrolling container. */
function pbSectionNav(nav){var links=Array.from(nav.querySelectorAll('a[href^="#"]')),secs=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1))}).filter(Boolean);if(!secs.length)return;
  var sc=secs[0].parentElement;while(sc&&sc!==document.body){var o=getComputedStyle(sc).overflowY;if(o==='auto'||o==='scroll')break;sc=sc.parentElement;}if(sc===document.body)sc=null;
  function set(id){links.forEach(function(a){a.setAttribute('aria-current',a.getAttribute('href')==='#'+id?'true':'false')});}
  var lock=0;function pick(){if(Date.now()<lock)return;var hh=sc?0:parseFloat(getComputedStyle(nav).getPropertyValue('--pb-head-h'))||0,top=(sc?sc.getBoundingClientRect().top:hh)+40,cur=secs[0];secs.forEach(function(s){if(s.getBoundingClientRect().top<=top)cur=s;});var end=sc?sc.scrollTop+sc.clientHeight>=sc.scrollHeight-4:innerHeight+scrollY>=document.documentElement.scrollHeight-4;if(end)cur=secs[secs.length-1];set(cur.id);}
  (sc||window).addEventListener('scroll',function(){requestAnimationFrame(pick)},{passive:true});
  links.forEach(function(a){a.addEventListener('click',function(e){var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();lock=Date.now()+1000;t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});set(t.id);var f=t.querySelector('h2');if(f){f.tabIndex=-1;f.focus({preventScroll:true});}});});pick();}
