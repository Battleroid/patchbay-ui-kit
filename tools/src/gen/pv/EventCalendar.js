function pbMEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
/* Event calendar: .pb-evcal[data-evcal] with JSON {month:"YYYY-MM", today:"YYYY-MM-DD", kinds:{key:{label,c}}, events:[{date, time, title, kind, status, repeat:"daily"|"weekly:N"|"monthly:D"}]}. Fires select with the event. */
function pbEventCal(el){var D=JSON.parse((el.querySelector('script[type="application/json"]')||{}).textContent||'{}'),K=D.kinds||{},E=D.events||[],today=D.today?new Date(D.today+'T12:00:00'):new Date(),cur=D.month?new Date(D.month+'-01T12:00:00'):new Date(today.getFullYear(),today.getMonth(),1,12),view=el.dataset.view||'month',max=+(el.dataset.max||3);
  var grid=el.querySelector('.pb-evcal__body'),title=el.querySelector('.pb-evcal__title');
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function on(d){var s=iso(d),dated=E.filter(function(e){return e.date===s&&!e.repeat});return E.filter(function(e){if(e.date===s&&!e.repeat)return true;if(e.repeat&&dated.some(function(x){return x.title===e.title&&x.time===e.time}))return false;if(e.date===s)return true;if(!e.repeat||s<e.date)return false;var r=e.repeat.split(':');if(r[0]==='daily')return true;if(r[0]==='weekly')return d.getDay()===+r[1];if(r[0]==='monthly')return d.getDate()===+r[1];return false;}).sort(function(a,b){return (a.time||'').localeCompare(b.time||'')});}
  function chip(e,d){var k=K[e.kind]||{};return '<button type="button" class="pb-evcal__ev" style="--c:'+(k.c||'var(--accent)')+'"'+(e.status?' data-status="'+e.status+'"':'')+' data-date="'+iso(d)+'" data-title="'+pbMEsc(e.title)+'" title="'+pbMEsc((e.time?e.time+' ':'')+e.title+(k.label?' · '+k.label:'')+(e.status==='down'?' · failed':''))+'">'+(e.time?'<b>'+pbMEsc(e.time)+'</b>':'')+'<span>'+pbMEsc(e.title)+'</span></button>';}
  function render(){var y=cur.getFullYear(),m=cur.getMonth();title.textContent=cur.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    el.querySelectorAll('[data-evcal-view] input').forEach(function(i){i.checked=i.value===view});
    if(view==='agenda'){var h='<ol class="pb-evcal__agenda">',n=new Date(y,m+1,0).getDate(),any=false;for(var i=1;i<=n;i++){var d=new Date(y,m,i,12),L=on(d);if(!L.length)continue;any=true;
        h+='<li><h4>'+d.toLocaleDateString(undefined,{weekday:'short'})+' '+i+'<small>'+(iso(d)===iso(today)?'today':d.toLocaleDateString(undefined,{month:'short'}))+'</small></h4><ul>'+L.map(function(e){return '<li>'+chip(e,d)+'</li>'}).join('')+'</ul></li>';}
      grid.innerHTML=any?h+'</ol>':'<p class="pb-note">Nothing scheduled this month.</p>';return;}
    var first=new Date(y,m,1,12),start=new Date(first);start.setDate(1-first.getDay());var h2='<div class="pb-evcal__grid" role="grid" aria-label="'+pbMEsc(title.textContent)+'">'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(function(w){return '<div class="pb-evcal__dow" role="columnheader">'+w+'</div>'}).join('');
    for(var c=0;c<42;c++){var d2=new Date(start);d2.setDate(start.getDate()+c);if(c>=35&&d2.getMonth()!==m)break;var L2=on(d2),out=d2.getMonth()!==m;
      h2+='<div class="pb-evcal__day" role="gridcell"'+(out?' data-out':'')+(iso(d2)===iso(today)?' data-today aria-current="date"':'')+' aria-label="'+d2.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})+(L2.length?', '+L2.length+' events':'')+'"><span class="pb-evcal__n">'+d2.getDate()+'</span>'+L2.slice(0,max).map(function(e){return chip(e,d2)}).join('')+(L2.length>max?'<button type="button" class="pb-evcal__more" data-more="'+iso(d2)+'">+'+(L2.length-max)+' more</button>':'')+'</div>';}
    grid.innerHTML=h2+'</div>';}
  el.addEventListener('click',function(e){var b=e.target.closest('[data-evcal-nav]');if(b){var v=b.dataset.evcalNav;if(v==='today')cur=new Date(today.getFullYear(),today.getMonth(),1,12);else cur=new Date(cur.getFullYear(),cur.getMonth()+(v==='next'?1:-1),1,12);render();return;}
    var mo=e.target.closest('[data-more]');if(mo){view='agenda';render();return;}
    var ev=e.target.closest('.pb-evcal__ev');if(ev){var d=new Date(ev.dataset.date+'T12:00:00'),x=on(d).filter(function(z){return z.title===ev.dataset.title})[0];el.dispatchEvent(new CustomEvent('select',{detail:{date:ev.dataset.date,event:x}}));}});
  el.querySelectorAll('[data-evcal-view] input').forEach(function(i){i.addEventListener('change',function(){if(i.checked){view=i.value;render();}});});
  var lg=el.querySelector('.pb-evcal__legend');if(lg)lg.innerHTML=Object.keys(K).map(function(k){return '<span><i style="--c:'+K[k].c+'"></i>'+pbMEsc(K[k].label)+'</span>'}).join('');
  el.pbGo=function(ym){cur=new Date(ym+'-01T12:00:00');render();};render();}

/* Markdown: a small, safe renderer (escapes HTML first). */
function pbMarkdown(src){var out=[],lines=String(src).replace(/\r/g,'').split('\n'),i=0;
  function inl(s){s=pbMEsc(s);var codes=[];s=s.replace(/`([^`]+)`/g,function(_,c){codes.push(c);return '\u0000'+(codes.length-1)+'\u0000';});
    s=s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|#)[^)\s]*)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g,'$1<em>$2</em>').replace(/~~([^~]+)~~/g,'<del>$1</del>');
    return s.replace(/\u0000(\d+)\u0000/g,function(_,n){return '<code>'+codes[+n]+'</code>';});}
  while(i<lines.length){var l=lines[i];
    if(/^```/.test(l)){var lang=l.slice(3).trim(),b=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))b.push(lines[i++]);i++;out.push('<pre><code'+(lang?' data-lang="'+pbMEsc(lang)+'"':'')+'>'+pbMEsc(b.join('\n'))+'</code></pre>');continue;}
    var h=l.match(/^(#{1,4})\s+(.*)$/);if(h){out.push('<h'+(h[1].length+1)+'>'+inl(h[2])+'</h'+(h[1].length+1)+'>');i++;continue;}
    if(/^>\s?/.test(l)){var q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,''));out.push('<blockquote><p>'+inl(q.join(' '))+'</p></blockquote>');continue;}
    if(/^\s*[-*]\s+/.test(l)){var it=[];while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i])){var t=lines[i++].replace(/^\s*[-*]\s+/,''),cb=t.match(/^\[( |x)\]\s+(.*)$/i);it.push(cb?'<li><input type="checkbox" class="pb-check" disabled'+(cb[1].toLowerCase()==='x'?' checked':'')+'> '+inl(cb[2])+'</li>':'<li>'+inl(t)+'</li>');}out.push('<ul>'+it.join('')+'</ul>');continue;}
    if(/^\s*\d+[.)]\s+/.test(l)){var it2=[];while(i<lines.length&&/^\s*\d+[.)]\s+/.test(lines[i]))it2.push('<li>'+inl(lines[i++].replace(/^\s*\d+[.)]\s+/,''))+'</li>');out.push('<ol>'+it2.join('')+'</ol>');continue;}
    if(/^\s*(---|\*\*\*)\s*$/.test(l)){out.push('<hr>');i++;continue;}
    if(!l.trim()){i++;continue;}
    var p=[];while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|```|>|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(lines[i]))p.push(lines[i++]);out.push('<p>'+inl(p.join(' '))+'</p>');}
  return out.join('\n');}
/* Markdown editor: .pb-md[data-md] with toolbar buttons data-md-cmd, view radios [data-md-view]. */
function pbMdEditor(el){var ta=el.querySelector('textarea'),pv=el.querySelector('.pb-md__preview'),cnt=el.querySelector('[data-md-count]'),tm=0;
  function up(){pv.innerHTML=pbMarkdown(ta.value)||'<p class="pb-note">Nothing to preview.</p>';if(cnt)cnt.textContent=ta.value.length+' characters';}
  function wrap(a,b,ph){var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value,sel=v.slice(s,e)||ph;ta.setRangeText(a+sel+b,s,e,'select');if(!v.slice(s,e)){ta.setSelectionRange(s+a.length,s+a.length+sel.length);}ta.focus();up();}
  function line(pre){var s=ta.selectionStart,v=ta.value,ls=v.lastIndexOf('\n',s-1)+1;ta.setRangeText(pre,ls,ls,'end');ta.focus();up();}
  var C={bold:function(){wrap('**','**','bold')},italic:function(){wrap('*','*','italic')},code:function(){wrap('`','`','code')},link:function(){wrap('[','](https://)','text')},h:function(){line('## ')},ul:function(){line('- ')},ol:function(){line('1. ')},task:function(){line('- [ ] ')},quote:function(){line('> ')},block:function(){wrap('\n```\n','\n```\n','code')}};
  el.querySelectorAll('[data-md-cmd]').forEach(function(b){b.addEventListener('click',function(){C[b.dataset.mdCmd]();});});
  ta.addEventListener('keydown',function(e){if(!(e.metaKey||e.ctrlKey))return;var k=e.key.toLowerCase(),m={b:'bold',i:'italic',k:'link',e:'code'}[k];if(m){e.preventDefault();C[m]();}});
  ta.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(up,120);});
  el.querySelectorAll('[data-md-view] input').forEach(function(i){if(i.checked)el.dataset.view=i.value;i.addEventListener('change',function(){if(i.checked){el.dataset.view=i.value;up();}});});
  el.pbValue=function(){return ta.value;};el.pbHtml=function(){return pbMarkdown(ta.value);};up();}

/* Comment thread: ol.pb-thread[data-thread] plus a .pb-composer[data-composer] after it. Fires post {text, parent}. */
function pbThread(th){var comp=th.parentElement.querySelector('[data-composer]'),me=th.dataset.me||'you';
  function node(text,reply){var li=document.createElement('li');li.className='pb-comment';li.innerHTML='<span class="pb-avatar" data-avatar data-name="'+pbMEsc(me)+'"></span><div class="pb-comment__head"><b>'+pbMEsc(me)+'</b><time class="pb-reltime" datetime="'+new Date().toISOString()+'">just now</time></div><div class="pb-comment__body">'+pbMarkdown(text)+'</div><div class="pb-comment__acts">'+(reply?'':'<button type="button" data-reply>Reply</button>')+'<button type="button" data-resolve>Resolve</button></div>';if(typeof pbAvatar==='function')pbAvatar(li.querySelector('[data-avatar]'));return li;}
  function composer(onPost,ph,cancel){var f=document.createElement('div');f.className='pb-composer';f.innerHTML='<span class="pb-avatar pb-avatar--sm" data-avatar data-name="'+pbMEsc(me)+'"></span><div class="pb-composer__box"><textarea placeholder="'+pbMEsc(ph||'Reply')+'" aria-label="'+pbMEsc(ph||'Reply')+'"></textarea><div class="pb-composer__acts"><span class="pb-note">⌘↵ to post</span>'+(cancel?'<button type="button" class="pb-btn pb-btn--ghost pb-btn--sm" data-cancel>Cancel</button>':'')+'<button type="button" class="pb-btn pb-btn--primary pb-btn--sm" data-post disabled>Post</button></div></div>';wire(f,onPost);if(typeof pbAvatar==='function')pbAvatar(f.querySelector('[data-avatar]'));return f;}
  function wire(f,onPost){var t=f.querySelector('textarea'),b=f.querySelector('[data-post]');t.addEventListener('input',function(){b.disabled=!t.value.trim();});
    function go(){var v=t.value.trim();if(!v)return;onPost(v);t.value='';b.disabled=true;}b.addEventListener('click',go);t.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();go();}if(e.key==='Escape'){var c=f.querySelector('[data-cancel]');if(c)c.click();}});var c=f.querySelector('[data-cancel]');if(c)c.addEventListener('click',function(){f.remove();});}
  if(comp)wire(comp,function(v){var n=node(v);th.appendChild(n);th.dispatchEvent(new CustomEvent('post',{detail:{text:v,parent:null}}));n.scrollIntoView({block:'nearest'});});
  th.addEventListener('click',function(e){var r=e.target.closest('[data-reply]');if(r){var c=r.closest('.pb-comment');var ex=c.querySelector(':scope > .pb-composer');if(ex){ex.querySelector('textarea').focus();return;}var ul=c.querySelector(':scope > .pb-comment__replies');
      var f=composer(function(v){if(!ul){ul=document.createElement('ol');ul.className='pb-comment__replies';c.insertBefore(ul,f);}ul.appendChild(node(v,true));f.remove();th.dispatchEvent(new CustomEvent('post',{detail:{text:v,parent:c}}));},'Reply to '+c.querySelector('.pb-comment__head b').textContent,true);f.style.gridColumn='2';c.appendChild(f);f.querySelector('textarea').focus();return;}
    var s=e.target.closest('[data-resolve]');if(s){var cm=s.closest('.pb-comment'),res=!cm.hasAttribute('data-resolved');cm.toggleAttribute('data-resolved',res);s.textContent=res?'Reopen':'Resolve';var h=cm.querySelector('.pb-comment__head'),chip=h.querySelector('.pb-comment__chip');if(res&&!chip)h.insertAdjacentHTML('beforeend','<span class="pb-comment__chip">resolved</span>');else if(!res&&chip)chip.remove();}});}

/* Notification grid: table in .pb-notify[data-notify]; header checkboxes [data-col] toggle a channel; [data-test] buttons fire test. */
function pbNotify(el){var t=el.querySelector('table');
  function col(i){return Array.from(t.querySelectorAll('tbody tr:not(.pb-notify__all)')).map(function(r){return r.cells[i].querySelector('input')}).filter(Boolean);}
  function sync(){t.querySelectorAll('[data-col]').forEach(function(h){var c=col(+h.dataset.col),n=c.filter(function(x){return x.checked}).length;h.checked=n===c.length;h.indeterminate=n>0&&n<c.length;});}
  t.addEventListener('change',function(e){var h=e.target.closest('[data-col]');if(h)col(+h.dataset.col).forEach(function(x){x.checked=h.checked});sync();el.dispatchEvent(new CustomEvent('change'));});
  el.querySelectorAll('[data-test]').forEach(function(b){b.addEventListener('click',function(){var l=b.textContent;b.disabled=true;b.textContent='Sending…';setTimeout(function(){b.disabled=false;b.textContent=l;el.dispatchEvent(new CustomEvent('test',{detail:b.dataset.test}));if(typeof pbToast==='function')pbToast({title:'Test sent to '+b.dataset.test,status:'ok',container:el.closest('section')||document.body});},700);});});sync();}

/* Action sheet: dialog.pb-sheet; open with sheet.pbOpen(); items close it and fire choose with data-value. */
function pbSheet(d){d.addEventListener('click',function(e){if(e.target===d){d.close('cancel');return;}var it=e.target.closest('.pb-sheet__item');if(it){d.close(it.dataset.value||'');d.dispatchEvent(new CustomEvent('choose',{detail:it.dataset.value||''}));}});
  d.pbOpen=function(){d.showModal();var f=d.querySelector('.pb-sheet__item');if(f)f.focus();};document.querySelectorAll('[data-sheet-open="'+d.id+'"]').forEach(function(b){b.addEventListener('click',d.pbOpen);});}

/* Session expiring: dialog.pb-session; dlg.pbStart(seconds). Fires stay or expire. */
function pbSession(dlg){var c=dlg.querySelector('.pb-session__count'),bar=dlg.querySelector('.pb-session__bar span'),live=dlg.querySelector('[data-session-live]'),iv=0,left=0,total=0;
  function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
  function tick(){left--;c.textContent=fmt(Math.max(0,left));bar.style.setProperty('--p',(left/total*100)+'%');dlg.toggleAttribute('data-urgent',left<=30);if(live&&(left%30===0||left===10))live.textContent='Signing out in '+fmt(left);if(left<=0){clearInterval(iv);dlg.close('expire');dlg.dispatchEvent(new CustomEvent('expire'));}}
  dlg.pbStart=function(s){total=left=s||120;c.textContent=fmt(left);bar.style.setProperty('--p','100%');dlg.removeAttribute('data-urgent');clearInterval(iv);iv=setInterval(tick,1000);if(!dlg.open)dlg.showModal();dlg.querySelector('[data-session-stay]').focus();};
  dlg.querySelector('[data-session-stay]').addEventListener('click',function(){clearInterval(iv);dlg.close('stay');dlg.dispatchEvent(new CustomEvent('stay'));});
  var so=dlg.querySelector('[data-session-out]');if(so)so.addEventListener('click',function(){clearInterval(iv);dlg.close('out');dlg.dispatchEvent(new CustomEvent('expire'));});
  dlg.addEventListener('cancel',function(e){e.preventDefault();});}
document.querySelectorAll('[data-evcal]').forEach(function(c){pbEventCal(c);c.addEventListener('select',function(e){var o=c.parentElement.querySelector('[data-evcal-out]'),x=e.detail.event;if(o&&x)o.textContent=e.detail.date+' '+(x.time||'')+' · '+x.title+(x.status==='down'?' · failed':'');});});
