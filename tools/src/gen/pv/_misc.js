Object.assign(pbStrings,Object.assign({threadHint:'{mod}↵ to post',sending:'Sending…',notifyTestSent:'Test sent to {channel}',notifyTestFailed:'Could not send the test to {channel}',sessionLeft:'Signing out in {t}',saveFailed:'Could not save',evFailed:'failed',evFailedN:'{n} failed',evEventOne:'{n} event',evEventOther:'{n} events',evMore:'+{n} more',evToday:'today',evNone:'Nothing scheduled this month.',mdEmpty:'Nothing to preview.',mdCount:'{n} characters',mdBold:'bold',mdItalic:'italic',mdCode:'code',mdText:'text',threadNow:'just now',threadReply:'Reply',threadReplyTo:'Reply to {name}',threadResolve:'Resolve',threadReopen:'Reopen',threadResolved:'resolved',threadPost:'Post'},pbStrings));
/* Event calendar: .pb-evcal[data-evcal] with JSON {month:"YYYY-MM", today:"YYYY-MM-DD", kinds:{key:{label,c}}, events:[{date, time, title, kind, status, repeat:"daily"|"weekly:N"|"monthly:D"}]}.
   The month is an ARIA date grid with one tab stop: arrows move by day and week, Home and End to the week's ends, PageUp and PageDown by month (Shift: year). Enter or Space (or a click or tap) on a day with events
   opens the agenda at that day; under 620 px the day cells are the targets (44 px) and events show as marks. Fires pb:select with the event, and pb:day {date, events}. */
function pbEventCal(el){var D=JSON.parse((el.querySelector('script[type="application/json"]')||{}).textContent||'{}'),K=D.kinds||{},E=D.events||[],today=D.today?new Date(D.today+'T12:00:00'):new Date(),cur=D.month?new Date(D.month+'-01T12:00:00'):new Date(today.getFullYear(),today.getMonth(),1,12),view=el.dataset.view||'month',max=+(el.dataset.max||3),
  pr=new Intl.PluralRules(document.documentElement.lang||undefined),grid=el.querySelector('.pb-evcal__body'),title=el.querySelector('.pb-evcal__title'),fd=null,focusNext=false,agendaTo=null;
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function at(s){return new Date(s+'T12:00:00');}
  function num(n,k){return pbFmt(pbStrings[k+(pr.select(n)==='one'?'One':'Other')],{n:n});}
  function on(d){var s=iso(d),dated=E.filter(function(e){return e.date===s&&!e.repeat});return E.filter(function(e){if(e.date===s&&!e.repeat)return true;if(e.repeat&&dated.some(function(x){return x.title===e.title&&x.time===e.time}))return false;if(e.date===s)return true;if(!e.repeat||s<e.date)return false;var r=e.repeat.split(':');if(r[0]==='daily')return true;if(r[0]==='weekly')return d.getDay()===+r[1];if(r[0]==='monthly')return d.getDate()===+r[1];return false;}).sort(function(a,b){return (a.time||'').localeCompare(b.time||'')});}
  function col(e){return e.status==='down'?'var(--down)':((K[e.kind]||{}).c||'var(--accent)');}
  function chip(e,d,tab){var k=K[e.kind]||{};return '<button type="button" class="pb-evcal__ev" data-style="--c:'+pbEsc(col(e))+'"'+(e.status?' data-status="'+pbEsc(e.status)+'"':'')+(tab?'':' tabindex="-1"')+' data-date="'+iso(d)+'" data-title="'+pbEsc(e.title)+'" title="'+pbEsc((e.time?e.time+' ':'')+e.title+(k.label?' · '+k.label:'')+(e.status==='down'?' · '+pbStrings.evFailed:''))+'">'+(e.time?'<b>'+pbEsc(e.time)+'</b>':'')+'<span>'+pbEsc(e.title)+'</span>'+(e.status==='down'?'<em class="pb-evcal__fail">'+pbEsc(pbStrings.evFailed)+'</em>':'')+'</button>';}
  function label(d,L){var f=L.filter(function(e){return e.status==='down'}).length;return d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})+(L.length?', '+num(L.length,'evEvent')+(f?', '+pbFmt(pbStrings.evFailedN,{n:f}):''):'');}
  function render(){var y=cur.getFullYear(),m=cur.getMonth();title.textContent=cur.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    el.querySelectorAll('[data-evcal-view] input').forEach(function(i){i.checked=i.value===view});
    if(view==='agenda'){var h='<ol class="pb-evcal__agenda">',n=new Date(y,m+1,0).getDate(),any=false;for(var i=1;i<=n;i++){var d=new Date(y,m,i,12),L=on(d);if(!L.length)continue;any=true;
        h+='<li data-date="'+iso(d)+'"><h4 tabindex="-1">'+pbEsc(d.toLocaleDateString(undefined,{weekday:'short'}))+' '+i+'<small>'+(iso(d)===iso(today)?pbEsc(pbStrings.evToday):pbEsc(d.toLocaleDateString(undefined,{month:'short'})))+'</small></h4><ul>'+L.map(function(e){return '<li>'+chip(e,d,true)+'</li>'}).join('')+'</ul></li>';}
      grid.innerHTML=any?h+'</ol>':'<p class="pb-note">'+pbEsc(pbStrings.evNone)+'</p>',pbStyled(grid);
      if(agendaTo){var t=grid.querySelector('li[data-date="'+agendaTo+'"] h4');agendaTo=null;if(t)t.focus();}return;}
    if(!fd||fd.slice(0,7)!==iso(cur).slice(0,7))fd=(iso(today).slice(0,7)===iso(cur).slice(0,7))?iso(today):iso(cur);
    var first=new Date(y,m,1,12),start=new Date(first);start.setDate(1-first.getDay());
    var dows=[0,1,2,3,4,5,6].map(function(w){return '<div class="pb-evcal__dow" role="columnheader">'+pbEsc(new Date(2023,0,1+w,12).toLocaleDateString(undefined,{weekday:'short'}))+'</div>'}).join('');
    var h2='<div class="pb-evcal__grid" role="grid" aria-label="'+pbEsc(title.textContent)+'"><div class="pb-evcal__row" role="row">'+dows+'</div>';
    for(var c=0;c<42;c++){var d2=new Date(start);d2.setDate(start.getDate()+c);if(c>=35&&d2.getMonth()!==m)break;var L2=on(d2),out=d2.getMonth()!==m;
      if(c%7===0)h2+='<div class="pb-evcal__row" role="row">';
      h2+='<div class="pb-evcal__day" role="gridcell" tabindex="-1" data-date="'+iso(d2)+'"'+(out?' data-out':'')+(iso(d2)===iso(today)?' data-today aria-current="date"':'')+' aria-label="'+pbEsc(label(d2,L2))+'"><span class="pb-evcal__n">'+d2.getDate()+'</span>'+L2.slice(0,max).map(function(e){return chip(e,d2,false)}).join('')+(L2.length>max?'<button type="button" class="pb-evcal__more" tabindex="-1" data-more="'+iso(d2)+'">'+pbEsc(pbFmt(pbStrings.evMore,{n:L2.length-max}))+'</button>':'')+
        (L2.length?'<span class="pb-evcal__marks" aria-hidden="true">'+L2.slice(0,4).map(function(e){return '<i data-style="--c:'+pbEsc(col(e))+'"'+(e.status==='down'?' data-status="down"':'')+'></i>'}).join('')+'</span>':'')+'</div>'+(c%7===6?'</div>':'');}
    grid.innerHTML=h2+'</div>',pbStyled(grid);
    var cell=grid.querySelector('.pb-evcal__day[data-date="'+fd+'"]')||grid.querySelector('.pb-evcal__day:not([data-out])');cell.tabIndex=0;if(focusNext){focusNext=false;cell.focus();}}
  function go(d){fd=iso(d);if(fd.slice(0,7)!==iso(cur).slice(0,7))cur=new Date(d.getFullYear(),d.getMonth(),1,12);render();}
  function openDay(s){fd=s;var L=on(at(s));el.dispatchEvent(new CustomEvent('pb:day',{bubbles:true,detail:{date:s,events:L}}));if(L.length){view='agenda';agendaTo=s;render();}}
  function months(d,k){var t=new Date(d.getFullYear(),d.getMonth()+k,1,12);t.setDate(Math.min(d.getDate(),new Date(t.getFullYear(),t.getMonth()+1,0).getDate()));return t;}
  el.addEventListener('keydown',function(e){var c=e.target.closest&&e.target.closest('.pb-evcal__day');if(!c||e.target!==c)return;var d=at(c.dataset.date),n=null,k=e.key;
    if(k==='ArrowLeft'||k==='ArrowRight'||k==='ArrowUp'||k==='ArrowDown'){n=new Date(d);n.setDate(d.getDate()+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7})[k]);}
    else if(k==='Home'||k==='End'){n=new Date(d);n.setDate(d.getDate()+(k==='Home'?-d.getDay():6-d.getDay()));}
    else if(k==='PageUp'||k==='PageDown')n=months(d,(k==='PageUp'?-1:1)*(e.shiftKey?12:1));
    if(n){e.preventDefault();focusNext=true;go(n);}else if(k==='Enter'||k===' '){e.preventDefault();openDay(c.dataset.date);}});
  el.addEventListener('click',function(e){var b=e.target.closest('[data-evcal-nav]');if(b){var v=b.dataset.evcalNav;if(v==='today')cur=new Date(today.getFullYear(),today.getMonth(),1,12);else cur=new Date(cur.getFullYear(),cur.getMonth()+(v==='next'?1:-1),1,12);render();return;}
    var mo=e.target.closest('[data-more]');if(mo){openDay(mo.dataset.more);return;}
    var ev=e.target.closest('.pb-evcal__ev');if(ev){var d=at(ev.dataset.date),x=on(d).filter(function(z){return z.title===ev.dataset.title})[0];el.dispatchEvent(new CustomEvent('pb:select',{bubbles:true,detail:{date:ev.dataset.date,event:x}}));return;}
    var dc=e.target.closest('.pb-evcal__day');if(dc){fd=dc.dataset.date;openDay(dc.dataset.date);if(view==='month'){grid.querySelectorAll('.pb-evcal__day[tabindex="0"]').forEach(function(x){x.tabIndex=-1;});dc.tabIndex=0;}}});
  el.querySelectorAll('[data-evcal-view] input').forEach(function(i){i.addEventListener('change',function(){if(i.checked){view=i.value;render();}});});
  var lg=el.querySelector('.pb-evcal__legend');if(lg)lg.innerHTML=Object.keys(K).map(function(k){return '<span><i data-style="--c:'+pbEsc(K[k].c)+'"></i>'+pbEsc(K[k].label)+'</span>'}).join(''),pbStyled(lg);
  el.pbGo=function(ym){cur=new Date(ym+'-01T12:00:00');render();};render();}

/* Markdown: a small, safe renderer (escapes HTML first). */
function pbMarkdown(src){var out=[],lines=String(src).replace(/\r/g,'').split('\n'),i=0;
  function inl(s){s=pbEsc(s);var codes=[];s=s.replace(/`([^`]+)`/g,function(_,c){codes.push(c);return '\u0000'+(codes.length-1)+'\u0000';});
    s=s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|#)[^)\s]*)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g,'$1<em>$2</em>').replace(/~~([^~]+)~~/g,'<del>$1</del>');
    return s.replace(/\u0000(\d+)\u0000/g,function(_,n){return '<code>'+codes[+n]+'</code>';});}
  while(i<lines.length){var l=lines[i];
    if(/^```/.test(l)){var lang=l.slice(3).trim(),b=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))b.push(lines[i++]);i++;out.push('<pre><code'+(lang?' data-lang="'+pbEsc(lang)+'"':'')+'>'+pbEsc(b.join('\n'))+'</code></pre>');continue;}
    var h=l.match(/^(#{1,4})\s+(.*)$/);if(h){out.push('<h'+(h[1].length+1)+'>'+inl(h[2])+'</h'+(h[1].length+1)+'>');i++;continue;}
    if(/^>\s?/.test(l)){var q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,''));out.push('<blockquote><p>'+inl(q.join(' '))+'</p></blockquote>');continue;}
    if(/^\s*[-*]\s+/.test(l)){var it=[];while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i])){var t=lines[i++].replace(/^\s*[-*]\s+/,''),cb=t.match(/^\[( |x)\]\s+(.*)$/i);it.push(cb?'<li><label class="pb-md__task"><input type="checkbox" class="pb-check" disabled'+(cb[1].toLowerCase()==='x'?' checked':'')+'> '+inl(cb[2])+'</label></li>':'<li>'+inl(t)+'</li>');}out.push('<ul>'+it.join('')+'</ul>');continue;}
    if(/^\s*\d+[.)]\s+/.test(l)){var it2=[];while(i<lines.length&&/^\s*\d+[.)]\s+/.test(lines[i]))it2.push('<li>'+inl(lines[i++].replace(/^\s*\d+[.)]\s+/,''))+'</li>');out.push('<ol>'+it2.join('')+'</ol>');continue;}
    if(/^\s*(---|\*\*\*)\s*$/.test(l)){out.push('<hr>');i++;continue;}
    if(!l.trim()){i++;continue;}
    var p=[];while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|```|>|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(lines[i]))p.push(lines[i++]);out.push('<p>'+inl(p.join(' '))+'</p>');}
  return out.join('\n');}
/* Markdown editor: .pb-md[data-md] with toolbar buttons data-md-cmd, view radios [data-md-view]. */
function pbMdEditor(el){var ta=el.querySelector('textarea'),pv=el.querySelector('.pb-md__preview'),cnt=el.querySelector('[data-md-count]'),tm=0;
  function up(){pv.innerHTML=pbMarkdown(ta.value)||'<p class="pb-note">'+pbEsc(pbStrings.mdEmpty)+'</p>',pbStyled(pv);if(cnt)cnt.textContent=pbFmt(pbStrings.mdCount,{n:ta.value.length});}
  function wrap(a,b,ph){var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value,sel=v.slice(s,e)||ph;ta.setRangeText(a+sel+b,s,e,'select');if(!v.slice(s,e)){ta.setSelectionRange(s+a.length,s+a.length+sel.length);}ta.focus();up();}
  function line(pre){var s=ta.selectionStart,v=ta.value,ls=v.lastIndexOf('\n',s-1)+1;ta.setRangeText(pre,ls,ls,'end');ta.focus();up();}
  var C={bold:function(){wrap('**','**',pbStrings.mdBold)},italic:function(){wrap('*','*',pbStrings.mdItalic)},code:function(){wrap('`','`',pbStrings.mdCode)},link:function(){wrap('[','](https://)',pbStrings.mdText)},h:function(){line('## ')},ul:function(){line('- ')},ol:function(){line('1. ')},task:function(){line('- [ ] ')},quote:function(){line('> ')},block:function(){wrap('\n```\n','\n```\n',pbStrings.mdCode)}};
  var KEY={bold:'B',italic:'I',link:'K',code:'E'},btns=[].slice.call(el.querySelectorAll('[data-md-cmd]'));
  btns.forEach(function(b,i){b.tabIndex=i?-1:0;b.addEventListener('click',function(){C[b.dataset.mdCmd]();});var k=KEY[b.dataset.mdCmd];if(k)b.title=(b.getAttribute('aria-label')||'')+' ('+pbModLabel()+k+')';});
  var bar=el.querySelector('.pb-md__bar');if(bar)bar.addEventListener('keydown',function(e){var i=btns.indexOf(document.activeElement);if(i<0)return;var n=e.key==='ArrowRight'?(i+1)%btns.length:e.key==='ArrowLeft'?(i-1+btns.length)%btns.length:e.key==='Home'?0:e.key==='End'?btns.length-1:-1;if(n<0)return;e.preventDefault();btns.forEach(function(b){b.tabIndex=-1;});btns[n].tabIndex=0;btns[n].focus();});
  btns.forEach(function(b){b.addEventListener('focus',function(){btns.forEach(function(x){x.tabIndex=x===b?0:-1;});});});
  ta.addEventListener('keydown',function(e){if(!(e.metaKey||e.ctrlKey)||e.altKey)return;var k=e.key.toLowerCase(),m={b:'bold',i:'italic',k:'link',e:'code'}[k];if(m){e.preventDefault();e.stopPropagation();C[m]();}});
  ta.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(up,120);});
  el.querySelectorAll('[data-md-view] input').forEach(function(i){if(i.checked)el.dataset.view=i.value;i.addEventListener('change',function(){if(i.checked){el.dataset.view=i.value;up();}});});
  el.pbValue=function(){return ta.value;};el.pbHtml=function(){return pbMarkdown(ta.value);};up();}

/* Comment thread: ol.pb-thread[data-thread] plus a .pb-composer[data-composer] after it. Fires pb:post {text, parent}. */
function pbThread(th){var comp=th.parentElement.querySelector('[data-composer]'),me=th.dataset.me||'you';
  function node(text,reply){var li=document.createElement('li');li.className='pb-comment';li.innerHTML='<span class="pb-avatar" data-avatar data-name="'+pbEsc(me)+'"></span><div class="pb-comment__head"><b>'+pbEsc(me)+'</b><time class="pb-reltime" datetime="'+new Date().toISOString()+'">'+pbEsc(pbStrings.threadNow)+'</time></div><div class="pb-comment__body">'+pbMarkdown(text)+'</div><div class="pb-comment__acts">'+(reply?'':'<button type="button" data-reply>'+pbEsc(pbStrings.threadReply)+'</button>')+'<button type="button" data-resolve>'+pbEsc(pbStrings.threadResolve)+'</button></div>',pbStyled(li);if(typeof pbAvatar==='function')pbAvatar(li.querySelector('[data-avatar]'));return li;}
  function composer(onPost,ph,cancel){var f=document.createElement('div');f.className='pb-composer';f.innerHTML='<span class="pb-avatar pb-avatar--sm" data-avatar data-name="'+pbEsc(me)+'"></span><div class="pb-composer__box"><textarea placeholder="'+pbEsc(ph||pbStrings.threadReply)+'" aria-label="'+pbEsc(ph||pbStrings.threadReply)+'"></textarea><div class="pb-composer__acts"><span class="pb-note">'+pbEsc(pbFmt(pbStrings.threadHint,{mod:pbModLabel()}))+'</span>'+(cancel?'<button type="button" class="pb-btn pb-btn--ghost pb-btn--sm" data-cancel>'+pbEsc(pbStrings.cancel)+'</button>':'')+'<button type="button" class="pb-btn pb-btn--primary pb-btn--sm" data-post disabled>'+pbEsc(pbStrings.threadPost)+'</button></div></div>',pbStyled(f);wire(f,onPost);if(typeof pbAvatar==='function')pbAvatar(f.querySelector('[data-avatar]'));return f;}
  function wire(f,onPost){var t=f.querySelector('textarea'),b=f.querySelector('[data-post]');t.addEventListener('input',function(){b.disabled=!t.value.trim();});
    function go(){var v=t.value.trim();if(!v)return;onPost(v);t.value='';b.disabled=true;}b.addEventListener('click',go);t.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();go();}if(e.key==='Escape'){var c=f.querySelector('[data-cancel]');if(c)c.click();}});var c=f.querySelector('[data-cancel]');if(c)c.addEventListener('click',function(){f.remove();});}
  if(comp)wire(comp,function(v){var n=node(v);th.appendChild(n);th.dispatchEvent(new CustomEvent('pb:post',{bubbles:true,detail:{text:v,parent:null}}));n.scrollIntoView({block:'nearest'});});
  th.addEventListener('click',function(e){var r=e.target.closest('[data-reply]');if(r){var c=r.closest('.pb-comment');var ex=c.querySelector(':scope > .pb-composer');if(ex){ex.querySelector('textarea').focus();return;}var ul=c.querySelector(':scope > .pb-comment__replies');
      var f=composer(function(v){if(!ul){ul=document.createElement('ol');ul.className='pb-comment__replies';c.insertBefore(ul,f);}ul.appendChild(node(v,true));f.remove();th.dispatchEvent(new CustomEvent('pb:post',{bubbles:true,detail:{text:v,parent:c}}));},pbFmt(pbStrings.threadReplyTo,{name:c.querySelector('.pb-comment__head b').textContent}),true);f.style.gridColumn='2';c.appendChild(f);f.querySelector('textarea').focus();return;}
    var s=e.target.closest('[data-resolve]');if(s){var cm=s.closest('.pb-comment'),res=!cm.hasAttribute('data-resolved');cm.toggleAttribute('data-resolved',res);s.textContent=res?pbStrings.threadReopen:pbStrings.threadResolve;var h=cm.querySelector('.pb-comment__head'),chip=h.querySelector('.pb-comment__chip');if(res&&!chip)h.insertAdjacentHTML('beforeend','<span class="pb-comment__chip">'+pbEsc(pbStrings.threadResolved)+'</span>'),pbStyled(h);else if(!res&&chip)chip.remove();}});}

/* Notification grid: table in .pb-notify[data-notify]; header checkboxes [data-col] toggle a channel; [data-test="channel"] buttons ask the app to send a test.
   Fires pb:change {name, checked} (or {column, checked}) and pb:test {channel}. The button waits ("Sending…") until the app settles it with pb:saved or
   pb:error ({message}) on the grid; the grid announces the result. Nothing is sent or faked here. */
function pbNotify(el){var t=el.querySelector('table'),live=el.querySelector('[data-notify-status]');
  if(!live){live=document.createElement('p');live.className='pb-sr';live.setAttribute('role','status');live.setAttribute('data-notify-status','');el.appendChild(live);}
  function col(i){return Array.from(t.querySelectorAll('tbody tr:not(.pb-notify__all)')).map(function(r){return r.cells[i].querySelector('input')}).filter(Boolean);}
  function sync(){t.querySelectorAll('[data-col]').forEach(function(h){var c=col(+h.dataset.col),n=c.filter(function(x){return x.checked}).length;h.checked=n===c.length;h.indeterminate=n>0&&n<c.length;});}
  t.addEventListener('change',function(e){var h=e.target.closest('[data-col]');if(h)col(+h.dataset.col).forEach(function(x){x.checked=h.checked});sync();
    el.dispatchEvent(new CustomEvent('pb:change',{bubbles:true,detail:h?{column:+h.dataset.col,checked:h.checked}:{name:e.target.name||e.target.getAttribute('aria-label'),checked:e.target.checked}}));});
  var waiting=null;
  function settle(ok,e){if(!waiting)return;var w=waiting;waiting=null;w.b.removeAttribute('aria-disabled');w.b.textContent=w.label;
    live.textContent=ok?pbFmt(pbStrings.notifyTestSent,{channel:w.channel}):((e.detail&&e.detail.message)||pbFmt(pbStrings.notifyTestFailed,{channel:w.channel}));}
  el.addEventListener('pb:saved',function(e){settle(true,e);});el.addEventListener('pb:error',function(e){settle(false,e);});
  el.querySelectorAll('[data-test]').forEach(function(b){b.addEventListener('click',function(){if(waiting)return;waiting={b:b,label:b.textContent,channel:b.dataset.test};b.setAttribute('aria-disabled','true');b.textContent=pbStrings.sending;live.textContent=pbStrings.sending;
    el.dispatchEvent(new CustomEvent('pb:test',{bubbles:true,detail:{channel:b.dataset.test,button:b}}));});});sync();}

/* Action sheet: dialog.pb-sheet; open it with a [data-pb-open="#id"] button or sheet.pbOpen(). The first item takes focus on pb:show; an item closes it and fires pb:choose with its data-value. */
function pbSheet(d){d.addEventListener('click',function(e){if(e.target===d){d.close('cancel');return;}var it=e.target.closest('.pb-sheet__item');if(it){d.close(it.dataset.value||'');d.dispatchEvent(new CustomEvent('pb:choose',{bubbles:true,detail:it.dataset.value||''}));}});
  d.addEventListener('pb:show',function(){var f=d.querySelector('.pb-sheet__item');if(f)f.focus();});
  d.pbOpen=function(){if(d.open)return;d.showModal();d.dispatchEvent(new CustomEvent('pb:show',{detail:{opener:null}}));};}

/* Session expiring: dialog.pb-session; dlg.pbStart(seconds). Fires pb:stay or pb:expire. */
function pbSession(dlg){var c=dlg.querySelector('.pb-session__count'),bar=dlg.querySelector('.pb-session__bar span'),live=dlg.querySelector('[data-session-live]'),iv=0,left=0,total=0;
  function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
  function tick(){left--;c.textContent=fmt(Math.max(0,left));bar.style.setProperty('--p',(left/total*100)+'%');dlg.toggleAttribute('data-urgent',left<=30);if(live&&(left%30===0||left===10))live.textContent=pbFmt(pbStrings.sessionLeft,{t:fmt(left)});if(left<=0){clearInterval(iv);dlg.close('expire');dlg.dispatchEvent(new CustomEvent('pb:expire',{bubbles:true}));}}
  dlg.pbStart=function(s){total=left=s||120;c.textContent=fmt(left);bar.style.setProperty('--p','100%');dlg.removeAttribute('data-urgent');clearInterval(iv);iv=setInterval(tick,1000);if(!dlg.open)dlg.showModal();dlg.querySelector('[data-session-stay]').focus();};
  dlg.querySelector('[data-session-stay]').addEventListener('click',function(){clearInterval(iv);dlg.close('stay');dlg.dispatchEvent(new CustomEvent('pb:stay',{bubbles:true}));});
  var so=dlg.querySelector('[data-session-out]');if(so)so.addEventListener('click',function(){clearInterval(iv);dlg.close('out');dlg.dispatchEvent(new CustomEvent('pb:expire',{bubbles:true,detail:{manual:true}}));});
  dlg.addEventListener('cancel',function(e){e.preventDefault();});}
/* Drop zone settings: .pb-dropset[data-dropset]. The bar summarises every control with data-sum ("expires {v}") or data-sum-on / data-sum-off. Fires pb:change with the settings.
   "Save as default" fires pb:default {settings} and shows "Saving…" until the app settles it with pb:saved or pb:error ({message}) on the element; only a pb:saved
   makes the current settings the baseline that Reset returns to. */
function pbDropSet(el){var bar=el.querySelector('.pb-dropset__bar'),panel=el.querySelector('.pb-dropset__panel'),sum=el.querySelector('[data-dropset-summary]'),init=[];
  function ctl(){return Array.from(panel.querySelectorAll('input,select'));}
  function snap(){return ctl().map(function(c){return c.type==='checkbox'||c.type==='radio'?c.checked:c.value});}
  init=snap();
  function read(){var parts=[],o={};ctl().forEach(function(c){var k=c.name||c.getAttribute('aria-label');
      if(c.type==='radio'){if(c.checked){o[k]=c.value;parts.push(c.dataset.sum.replace('{v}',c.value));}}
      else if(c.type==='checkbox'){o[k]=c.checked;var t=c.checked?c.dataset.sumOn:c.dataset.sumOff;if(t)parts.push(t);var r=c.dataset.dropsetReveal&&el.querySelector('#'+c.dataset.dropsetReveal);if(r)r.hidden=!c.checked;var en=c.dataset.dropsetEnable&&el.querySelector('#'+c.dataset.dropsetEnable);if(en){en.toggleAttribute('data-off',!c.checked);en.querySelectorAll('input,select').forEach(function(i){i.disabled=!c.checked;});}}
      else if(c.dataset.sum){o[k]=c.value;parts.push(c.dataset.sum.replace('{v}',c.options?c.options[c.selectedIndex].text.split(' · ')[0]:c.value));}});
    sum.textContent=parts.filter(Boolean).join(' · ');return o;}
  bar.addEventListener('click',function(){var o=bar.getAttribute('aria-expanded')!=='true';bar.setAttribute('aria-expanded',o);panel.hidden=!o;if(o){var f=panel.querySelector('input:checked,input,select');if(f)f.focus();}});
  panel.addEventListener('change',function(){el.dispatchEvent(new CustomEvent('pb:change',{bubbles:true,detail:read()}));});
  panel.addEventListener('keydown',function(e){if(e.key==='Escape'){bar.setAttribute('aria-expanded','false');panel.hidden=true;bar.focus();}});
  var rs=el.querySelector('[data-dropset-reset]');if(rs)rs.addEventListener('click',function(){ctl().forEach(function(c,i){if(c.type==='checkbox'||c.type==='radio')c.checked=init[i];else c.value=init[i];});read();});
  var df=el.querySelector('[data-dropset-default]'),pend=null,tm=0;
  function settle(ok,e){if(!pend)return;var p=pend;pend=null;clearTimeout(tm);df.disabled=false;
    if(ok){init=p.snap;df.textContent=pbStrings.saved;tm=setTimeout(function(){df.textContent=p.label;},1400);}
    else{df.textContent=p.label;df.setAttribute('data-error','');df.title=(e.detail&&e.detail.message)||pbStrings.saveFailed;}}
  if(df){el.addEventListener('pb:saved',function(e){settle(true,e);});el.addEventListener('pb:error',function(e){settle(false,e);});
    df.addEventListener('click',function(){if(pend)return;clearTimeout(tm);df.removeAttribute('data-error');df.removeAttribute('title');pend={snap:snap(),label:df.dataset.label||(df.dataset.label=df.textContent)};df.textContent=pbStrings.saving;df.disabled=true;
      el.dispatchEvent(new CustomEvent('pb:default',{bubbles:true,detail:read()}));});}
  read();}
