/* Patchbay form controls and small behaviors: combobox, tags, code input, colors, copy, reveal, key/value, ranges, counters, toggles, tabs, form sections, tables, code areas. */
function pbCombo(c){var inp=c.querySelector('input'),lb=c.querySelector('.pb-listbox'),opts=[].slice.call(lb.querySelectorAll('.pb-option:not(.pb-option--empty)')),empty=lb.querySelector('.pb-option--empty'),groups=[].slice.call(lb.querySelectorAll('.pb-listbox__group')),act=-1,uid='o'+Math.random().toString(36).slice(2,7);
 opts.forEach(function(o,i){o.id=uid+i;o.dataset.label=o.childNodes[1]?o.childNodes[1].textContent:o.textContent;});
 function vis(){return opts.filter(function(o){return !o.hidden});}
 function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
 function filter(q){q=q.toLowerCase();opts.forEach(function(o){var l=o.dataset.label,i=q?l.toLowerCase().indexOf(q):0;o.hidden=q&&i<0;var t=o.childNodes[1];if(t&&t.nodeType===3||o.querySelector('mark')){var span=o.querySelector('.pb-option__text');if(!span){span=document.createElement('span');span.className='pb-option__text';o.replaceChild(span,o.childNodes[1]);}span.innerHTML=q&&i>=0?esc(l.slice(0,i))+'<mark>'+esc(l.slice(i,i+q.length))+'</mark>'+esc(l.slice(i+q.length)):esc(l),pbStyled(span);}});
  groups.forEach(function(g){var n=g.nextElementSibling,any=false;while(n&&!n.classList.contains('pb-listbox__group')){if(n.classList.contains('pb-option')&&!n.hidden&&n!==empty)any=true;n=n.nextElementSibling;}g.hidden=!any;});
  empty.hidden=vis().length>0;setAct(vis().length?0:-1);}
 function setAct(i){var v=vis();opts.forEach(function(o){o.removeAttribute('data-active')});act=i;if(i>=0&&v[i]){v[i].setAttribute('data-active','');inp.setAttribute('aria-activedescendant',v[i].id);v[i].scrollIntoView({block:'nearest'});}else inp.removeAttribute('aria-activedescendant');}
 function open(all){lb.hidden=false;inp.setAttribute('aria-expanded','true');filter(all?'':inp.value);}
 function close(){lb.hidden=true;inp.setAttribute('aria-expanded','false');}
 function choose(o){opts.forEach(function(x){x.setAttribute('aria-selected',x===o)});inp.value=o.dataset.value;close();inp.dispatchEvent(new Event('change',{bubbles:true}));}
 opts.forEach(function(o){o.setAttribute('aria-selected',o.dataset.value===inp.value);o.addEventListener('mousedown',function(e){e.preventDefault();choose(o);});});
 inp.addEventListener('input',function(){open(false);});inp.addEventListener('focus',function(){inp.select();});
 inp.addEventListener('keydown',function(e){var v=vis();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(lb.hidden){open(true);return;}setAct(Math.max(0,Math.min(v.length-1,act+(e.key==='ArrowDown'?1:-1))));}
  else if(e.key==='Enter'&&!lb.hidden&&v[act]){e.preventDefault();choose(v[act]);}else if(e.key==='Escape'){close();}});
 inp.addEventListener('blur',close);c.querySelector('[data-combo-toggle]').addEventListener('mousedown',function(e){e.preventDefault();lb.hidden?(inp.focus(),open(true)):close();});}
function pbTags(box){var inp=box.querySelector('input');
 function add(v){v=v.trim().replace(/,$/,'');if(!v)return;if([].some.call(box.querySelectorAll('.pb-tag'),function(t){return t.firstChild.textContent===v}))return;
  var t=document.createElement('span');t.className='pb-tag';t.textContent=v;var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Remove '+v);b.innerHTML='<span class="pb-icon pb-icon--close"></span>',pbStyled(b);t.appendChild(b);box.insertBefore(t,inp);box.dispatchEvent(new Event('change',{bubbles:true}));}
 box.addEventListener('click',function(e){var b=e.target.closest('.pb-tag button');if(b){b.parentNode.remove();inp.focus();}else if(e.target===box)inp.focus();});
 inp.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===','||e.key==='Tab'&&inp.value){if(inp.value.trim()){e.preventDefault();add(inp.value);inp.value='';}}
  else if(e.key==='Backspace'&&!inp.value){var l=box.querySelectorAll('.pb-tag');if(l.length)l[l.length-1].remove();}});
 inp.addEventListener('paste',function(e){var t=(e.clipboardData||window.clipboardData).getData('text');if(/[,\n]/.test(t)){e.preventDefault();t.split(/[,\n]/).forEach(add);}});}
function pbOtp(g){var ins=[].slice.call(g.querySelectorAll('input'));
 function done(){var v=ins.map(function(i){return i.value}).join('');var f=g.closest('.pb-field');if(v.length===ins.length){f&&f.setAttribute('data-valid','');g.dispatchEvent(new CustomEvent('complete',{detail:v,bubbles:true}));}else f&&f.removeAttribute('data-valid');}
 ins.forEach(function(inp,i){inp.addEventListener('input',function(){inp.value=inp.value.replace(/\D/g,'').slice(-1);if(inp.value&&ins[i+1])ins[i+1].focus();done();});
  inp.addEventListener('keydown',function(e){if(e.key==='Backspace'&&!inp.value&&ins[i-1]){ins[i-1].value='';ins[i-1].focus();e.preventDefault();done();}
   else if(e.key==='ArrowLeft'&&ins[i-1])ins[i-1].focus();else if(e.key==='ArrowRight'&&ins[i+1])ins[i+1].focus();});
  inp.addEventListener('focus',function(){inp.select();});
  inp.addEventListener('paste',function(e){var t=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');if(!t)return;e.preventDefault();for(var k=0;k<ins.length-i&&k<t.length;k++)ins[i+k].value=t[k];(ins[Math.min(ins.length-1,i+t.length)]).focus();done();});});}
var PB_SW=[['#1f3fd6','Blue'],['#ff5b35','Red'],['#ffd23f','Yellow'],['#45d6a5','Mint'],['#0b7a5c','Green'],['#8a5200','Ochre'],['#c42d16','Brick'],['#8a2f9e','Plum'],['#17150f','Ink'],['#5b564c','Grey'],['#dcd6ca','Sand'],['#ffffff','White']];
function pbSwatches(g){var s=[].slice.call(g.querySelectorAll('.pb-swatch'));
 function pick(b){s.forEach(function(x){x.setAttribute('aria-checked',x===b);x.tabIndex=x===b?0:-1;});b.focus();}
 s.forEach(function(b,i){b.tabIndex=b.getAttribute('aria-checked')==='true'?0:-1;b.addEventListener('click',function(){pick(b)});
  b.addEventListener('keydown',function(e){var d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(d){e.preventDefault();pick(s[(i+d+s.length)%s.length]);}});});}
function pbColorField(f){var sw=f.querySelector('.pb-input__swatch'),inp=f.querySelector('input'),pop=document.createElement('div');pop.className='pb-colorpop';pop.setAttribute('popover','');pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Choose a color');
 pop.innerHTML='<span class="pb-eyebrow">kit colors</span><div class="pb-swatches">'+PB_SW.map(function(c){return '<button type="button" class="pb-swatch" data-style="--c:'+c[0]+'" data-hex="'+c[0]+'" aria-label="'+c[1]+'"></button>'}).join('')+'</div><span class="pb-eyebrow">custom</span><div class="pb-swatches"><label class="pb-swatch pb-swatch--custom" aria-label="Custom color"><span class="pb-icon pb-icon--plus"></span><input type="color"></label></div>',pbStyled(pop);
 (f.closest('label,.pb-field')||f).after(pop);
 function set(h){if(!/^#[0-9a-f]{6}$/i.test(h)){f.closest('.pb-field').setAttribute('data-invalid','');return;}f.closest('.pb-field').removeAttribute('data-invalid');h=h.toLowerCase();inp.value=h;sw.style.setProperty('--c',h);pop.querySelectorAll('[data-hex]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.hex===h)});}
 function place(){pbPlace(f,pop,{gap:6});}
 sw.addEventListener('click',function(){if(pop.matches(':popover-open'))return pop.hidePopover();set(inp.value);pop.showPopover();place();(pop.querySelector('[aria-pressed="true"]')||pop.querySelector('.pb-swatch')).focus();});
 pbOnDoc('scroll',f,function(){if(pop.matches(':popover-open'))place();});pbOnDoc('resize',f,function(){if(pop.matches(':popover-open'))place();});
 pop.addEventListener('click',function(e){var b=e.target.closest('[data-hex]');if(b){set(b.dataset.hex);pop.hidePopover();sw.focus();}});
 pop.querySelector('input[type=color]').addEventListener('input',function(e){set(e.target.value);});
 inp.addEventListener('change',function(){set(inp.value.trim().replace(/^([0-9a-f]{6})$/i,'#$1'));});set(inp.value);}
function pbCopied(b,ok){var lab=b.querySelector('span:not(.pb-icon)'),ic=b.querySelector('.pb-icon');var o1=lab&&lab.textContent,o2=ic&&ic.className;
 if(lab)lab.textContent=ok?'Copied':'Press ⌘C';if(ic&&ok)ic.className='pb-icon pb-icon--check';if(ok)b.setAttribute('data-done','');if(b.dataset.tip!=null){b.dataset.tip=ok?'Copied':'Press ⌘C';b.setAttribute('data-tip-open','');}
 setTimeout(function(){if(lab)lab.textContent=o1;if(ic)ic.className=o2;b.removeAttribute('data-done');if(b.dataset.tip!=null){b.dataset.tip='Copy';b.removeAttribute('data-tip-open');}},1600);}
function pbCopyField(b){b.addEventListener('click',function(){var d=b.dataset,tg=d.copyTarget?document.querySelector(d.copyTarget):null,inp=tg||b.parentNode.querySelector('input,textarea'),
  t=d.copyValue!=null?d.copyValue:d.copyText!=null?d.copyText:inp?(/^(INPUT|TEXTAREA|SELECT|OUTPUT)$/.test(inp.tagName)?inp.value:inp.textContent):'';
 var p=navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject();
 p.then(function(){pbCopied(b,true)},function(){if(inp&&inp.select){inp.focus();inp.select();}pbCopied(b,false);});});}
function pbReveal(b){b.addEventListener('click',function(){var i=b.parentNode.querySelector('input');if(!i)return;var s=i.type==='password',ic=b.querySelector('.pb-icon'),l=b.getAttribute('aria-label')||'Show password';i.type=s?'text':'password';
  if(ic)ic.className='pb-icon pb-icon--'+(s?'eye-off':'eye');b.setAttribute('aria-label',s?l.replace(/^Show\b/,'Hide'):l.replace(/^Hide\b/,'Show'));});}
function pbKV(kv){var add=kv.querySelector('[data-add]');
 kv.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var row=b.closest('.pb-kv__row');
  if(b.hasAttribute('data-remove')){var n=row.nextElementSibling;row.remove();(n&&n.querySelector('input')||add).focus();}
  else if(b.hasAttribute('data-secret')){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);row.querySelectorAll('input')[1].type=on?'password':'text';}
  else if(b.hasAttribute('data-add')){var r=kv.querySelector('.pb-kv__row').cloneNode(true);r.querySelectorAll('input').forEach(function(i){i.value='';i.type='text'});r.querySelector('[data-secret]').setAttribute('aria-pressed','false');r.querySelector('[data-remove]').setAttribute('aria-label','Remove row');kv.insertBefore(r,add);r.querySelector('input').focus();}});
 kv.addEventListener('input',function(e){var i=e.target;if(i.closest('.pb-kv__row')&&i===i.closest('.pb-kv__row').querySelector('input')){i.value=i.value.toUpperCase().replace(/[^A-Z0-9_]/g,'_');var x=i.closest('.pb-kv__row').querySelector('[data-remove]');x.setAttribute('aria-label','Remove '+(i.value||'row'));}});}
function pbSize(p){var b=Math.pow(10,p/100*8);return b<1e3?Math.round(b)+' KB':b<1e6?Math.round(b/1e3)+' MB':(b<1e7?(b/1e6).toFixed(1).replace('.0',''):Math.round(b/1e6))+' GB';}
function pbDualRange(w){var r=w.querySelectorAll('input'),out=w.closest('.pb-field').querySelector('[data-out]'),u=w.dataset.unit;
 function fmt(v){return u==='hour'?String(v).padStart(2,'0')+':00':pbSize(+v);}
 function up(e){var a=+r[0].value,b=+r[1].value;if(a>b){if(e&&e.target===r[0])r[0].value=b;else r[1].value=a;}a=+r[0].value;b=+r[1].value;var mx=+r[0].max;
  w.style.setProperty('--lo',a/mx*100+'%');w.style.setProperty('--hi',b/mx*100+'%');r[0].style.zIndex=a>mx-2?2:1;out.textContent=fmt(a)+' – '+fmt(b);}
 r.forEach(function(x){x.addEventListener('input',up)});up();}
function pbToggle(b){b.addEventListener('click',function(){b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')})}
function pbCounter(t){var c=t.closest('.pb-field').querySelector('.pb-field__count');if(!c)return;var max=+t.dataset.count;function up(){var n=t.value.length;c.textContent=n+' / '+max;n>max?c.setAttribute('data-over',''):c.removeAttribute('data-over');}t.addEventListener('input',up);up();}
function pbStepper(b){b.addEventListener('click',function(){var i=b.parentNode.querySelector('input');if(!i)return;b.hasAttribute('data-inc')?i.stepUp():i.stepDown();
  i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));});}
function pbColorText(c){c.addEventListener('input',function(){if(c.nextElementSibling)c.nextElementSibling.value=c.value;});}
function pbStrength(m){var i=m.closest('.pb-field').querySelector('input');function up(){var v=i.value,s=0;if(v.length>=8)s++;if(v.length>=12)s++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))s++;if(/[\d\W_]/.test(v))s++;if(!v)s=0;else s=Math.max(1,s);m.dataset.level=s;m.lastElementChild.textContent=['','weak','fair','good','strong'][s];}i.addEventListener('input',up);up();}
function pbRange(r){var o=r.closest('.pb-field').querySelector('output');function up(){var p=(r.value-r.min)/((r.max||100)-(r.min||0))*100;r.style.setProperty('--pct',p+'%');if(o)o.textContent=r.value+(o.textContent.indexOf('%')>-1?'%':'');}r.addEventListener('input',up);up();}
function pbTabs(l){var tabs=[].slice.call(l.querySelectorAll('.pb-tab[aria-controls]')),panel=function(t){return document.getElementById(t.getAttribute('aria-controls'));};
 tabs.forEach(function(t){t.addEventListener('click',function(){if(t.getAttribute('aria-selected')==='true')return;tabs.forEach(function(x){x.setAttribute('aria-selected',x===t);var p=panel(x);if(p)p.hidden=x!==t;});
  l.dispatchEvent(new CustomEvent('pb:tabchange',{bubbles:true,detail:{tab:t,panel:panel(t)}}));});});}
function pbSection(f){var st=f.querySelector('.pb-foot__status'),btns=f.querySelectorAll('button:not(.pb-btn--danger)'),clean=true;
 function set(dirty,msg,state){btns.forEach(function(b){b.disabled=!dirty});if(st){st.textContent=msg;state?st.dataset.state=state:st.removeAttribute('data-state');}}
 f.addEventListener('input',function(){set(true,'Unsaved changes','dirty')});f.addEventListener('change',function(){set(true,'Unsaved changes','dirty')});
 f.addEventListener('reset',function(){setTimeout(function(){set(false,'No changes')})});
 f.addEventListener('click',function(e){var b=e.target.closest('.pb-btn--primary');if(!b)return;set(false,'Saved just now','saved');if(st){st.insertAdjacentHTML('afterbegin','<span class="pb-icon pb-icon--status-ok"></span>'),pbStyled(st);}});}
function pbDialogOpen(b){b.addEventListener('click',function(){document.getElementById(b.dataset.open).showModal();});}
function pbTableBasic(t){var body=t.tBodies[0];if(!body||t.closest('[data-dt],[data-bulk]'))return;var wrap=t.closest('.pb-tablewrap'),all=t.querySelector('[data-all]'),rows=[].slice.call(body.rows),out=wrap&&wrap.querySelector('[data-selcount]');
 function chk(r){return r.querySelector('.pb-check');}
 function sync(){var n=0;rows.forEach(function(r){var c=chk(r);if(!c)return;r.setAttribute('aria-selected',c.checked);if(c.checked)n++;});all.checked=n===rows.length;all.indeterminate=n>0&&n<rows.length;out.textContent=n?n+' selected':'';}
 var sel=all&&out;if(sel){rows.forEach(function(r){var c=chk(r);if(c)c.addEventListener('change',sync);});all.addEventListener('change',function(){rows.forEach(function(r){var c=chk(r);if(c)c.checked=all.checked});sync();});}
 t.querySelectorAll('th[aria-sort] > button').forEach(function(btn){var th=btn.parentNode;btn.addEventListener('click',function(){var col=[].indexOf.call(th.parentNode.children,th);var dir=th.getAttribute('aria-sort')==='ascending'?'descending':'ascending';
  t.querySelectorAll('th[aria-sort]').forEach(function(x){x.setAttribute('aria-sort','none')});th.setAttribute('aria-sort',dir);
  rows.sort(function(a,b){var x=a.cells[col]?a.cells[col].textContent:'',y=b.cells[col]?b.cells[col].textContent:'',nx=parseFloat(x),ny=parseFloat(y);var c=isNaN(nx)||isNaN(ny)?x.localeCompare(y):nx-ny;return dir==='ascending'?c:-c;});
  rows.forEach(function(r){body.appendChild(r)});t.dispatchEvent(new CustomEvent('pb:sort',{bubbles:true,detail:{column:col,direction:dir}}));});});
 if(sel)sync();}
function pbIndeterminate(c){c.indeterminate=true}
/* Code area: YAML-ish highlighting under a transparent textarea, with a line gutter. */
function pbCodeHL(src){var esc=pbEsc;
return src.split('\n').map(function(l){var m;
 if(/^\s*#/.test(l))return '<span class="tok-c">'+esc(l)+'</span>';
 if(m=l.match(/^(\s*)(- )?([\w.-]+)(:)(\s.*|)$/)){return m[1]+(m[2]?'<span class="tok-p">- </span>':'')+'<span class="tok-k">'+esc(m[3])+'</span><span class="tok-p">:</span>'+val(m[5]);}
 if(m=l.match(/^(\s*)(- )(.*)$/))return m[1]+'<span class="tok-p">- </span>'+val(' '+m[3]).slice(1);
 return esc(l);
 function val(v){if(/^\s*$/.test(v))return esc(v);var s=v.match(/^(\s*)(.*)$/);var x=s[2];
  if(/^".*"$/.test(x))return s[1]+'<span class="tok-s">'+esc(x)+'</span>';
  if(/^(true|false|null|[\d.:]+)$/.test(x))return s[1]+'<span class="tok-n">'+esc(x)+'</span>';
  if(/^\//.test(x))return s[1]+'<span class="tok-s">'+esc(x)+'</span>';
  return s[1]+'<span class="tok-t">'+esc(x)+'</span>';}
}).join('\n')+'\n';}
function pbCodeArea(c){var ta=c.querySelector('textarea'),h=c.querySelector('.pb-code__hl'),g=c.querySelector('.pb-code__gutter');if(!ta||!h)return;
 function up(){h.innerHTML=pbCodeHL(ta.value),pbStyled(h);if(g)g.textContent=ta.value.split('\n').map(function(_,i){return i+1}).join('\n');}
 ta.addEventListener('input',up);up();}
/* .pb-progress[data-value="0..100"] sets --value for the bar inside; el.pbSet(v) updates it. */
function pbProgress(p){function set(v){var n=parseFloat(v);if(isNaN(n))return;p.style.setProperty('--value',Math.max(0,Math.min(100,n))+'%');p.setAttribute('data-value',n);}p.pbSet=set;set(p.getAttribute('data-value'));}
function pbDismiss(b){b.addEventListener('click',function(){var s=b.closest('.pb-sitebar,.pb-notice,.pb-toast');if(s)s.remove();});}
