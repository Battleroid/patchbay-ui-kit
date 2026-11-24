/* Patchbay form controls and small behaviors: combobox, tags, code input, colors, copy, reveal, key/value, ranges, counters, toggles, tabs, form sections, tables, code areas. */
function pbCombo(c){var inp=c.querySelector('input'),lb=c.querySelector('.pb-listbox'),opts=[].slice.call(lb.querySelectorAll('.pb-option:not(.pb-option--empty)')),empty=lb.querySelector('.pb-option--empty'),groups=[].slice.call(lb.querySelectorAll('.pb-listbox__group')),nav=false,keys;
 if(!lb.id)lb.id=pbId('pb-listbox');inp.setAttribute('aria-controls',lb.id);
 opts.forEach(function(o){if(!o.id)o.id=pbId('pb-opt');o.dataset.label=o.childNodes[1]?o.childNodes[1].textContent:o.textContent;});
 function vis(){return opts.filter(function(o){return !o.hidden});}
 function filter(q){q=q.toLowerCase();opts.forEach(function(o){var l=o.dataset.label,i=q?l.toLowerCase().indexOf(q):0;o.hidden=q&&i<0;var t=o.childNodes[1];if(t&&t.nodeType===3||o.querySelector('mark')){var span=o.querySelector('.pb-option__text');if(!span){span=document.createElement('span');span.className='pb-option__text';o.replaceChild(span,o.childNodes[1]);}span.innerHTML=pbMark(l,q&&i>=0?q:'');}});
  groups.forEach(function(g){var n=g.nextElementSibling,any=false;while(n&&!n.classList.contains('pb-listbox__group')){if(n.classList.contains('pb-option')&&!n.hidden&&n!==empty)any=true;n=n.nextElementSibling;}g.hidden=!any;});
  if(empty)empty.hidden=vis().length>0;if(vis().length)keys.move(0);else keys.clear();}
 function open(all){lb.hidden=false;inp.setAttribute('aria-expanded','true');filter(all?'':inp.value);}
 function close(){lb.hidden=true;inp.setAttribute('aria-expanded','false');nav=false;}
 function choose(o){opts.forEach(function(x){x.setAttribute('aria-selected',x===o)});inp.value=o.dataset.value;close();inp.dispatchEvent(new Event('change',{bubbles:true}));}
 opts.forEach(function(o){o.setAttribute('aria-selected',o.dataset.value===inp.value);o.addEventListener('mousedown',function(e){e.preventDefault();choose(o);});});
 inp.addEventListener('input',function(){nav=false;open(false);});inp.addEventListener('focus',function(){inp.select();});
 /* Registered before pbListKeys: ↑/↓ on a closed list open it; once the list is open they move the active option (pbListKeys), and Home/End
    join in after an arrow key moved into the list (before that they move the text caret). */
 inp.addEventListener('keydown',function(e){if(e.altKey&&e.key==='ArrowDown'){e.preventDefault();open(true);return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(lb.hidden){e.preventDefault();open(true);}else nav=true;}
  else if(e.key==='Enter'&&!lb.hidden){var v=vis(),i=keys.index();if(v[i]){e.preventDefault();choose(v[i]);}}else if(e.key==='Escape'&&!lb.hidden){e.preventDefault();close();}});
 keys=pbListKeys(lb,{mode:'active',input:inp,items:vis,wrap:false,idPrefix:'pb-opt',homeEnd:function(){return !lb.hidden&&nav;}});
 inp.addEventListener('blur',close);c.querySelector('[data-combo-toggle]').addEventListener('mousedown',function(e){e.preventDefault();lb.hidden?(inp.focus(),open(true)):close();});}
function pbTags(box){var inp=box.querySelector('input:not([type=hidden])'),sep=box.dataset.sep||',',hid=box.querySelector('input[type=hidden],[data-tags-input]');
 if(!hid&&box.dataset.name){hid=document.createElement('input');hid.type='hidden';hid.name=box.dataset.name;box.appendChild(hid);}
 function vals(){return [].map.call(box.querySelectorAll('.pb-tag'),function(t){return t.firstChild.textContent;});}
 function sync(fire){if(hid)hid.value=vals().join(sep);if(fire)box.dispatchEvent(new Event('change',{bubbles:true}));}
 function add(v,quiet){v=String(v).trim().replace(/,$/,'');if(!v)return;if(vals().indexOf(v)>=0)return;
  var t=document.createElement('span');t.className='pb-tag';t.textContent=v;var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Remove '+v);b.innerHTML='<span class="pb-icon pb-icon--close"></span>';t.appendChild(b);box.insertBefore(t,inp);sync(!quiet);}
 box.addEventListener('click',function(e){var b=e.target.closest('.pb-tag button');if(b){b.parentNode.remove();sync(true);inp.focus();}else if(e.target===box)inp.focus();});
 inp.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===','||e.key==='Tab'&&inp.value){if(inp.value.trim()){e.preventDefault();add(inp.value);inp.value='';}}
  else if(e.key==='Backspace'&&!inp.value){var l=box.querySelectorAll('.pb-tag');if(l.length){l[l.length-1].remove();sync(true);}}});
 inp.addEventListener('paste',function(e){var t=(e.clipboardData||window.clipboardData).getData('text');if(/[,\n]/.test(t)){e.preventDefault();t.split(/[,\n]/).forEach(function(v){add(v);});}});
 /* el.pbSet(['a','b'] or 'a,b') replaces the tags; el.pbValues() reads them. */
 box.pbSet=function(v){if(typeof v==='string')v=v.split(sep);box.querySelectorAll('.pb-tag').forEach(function(t){t.remove();});(v||[]).forEach(function(x){add(x,true);});sync(true);};
 box.pbValues=vals;
 /* Text typed but not yet committed with Enter or a comma counts too: commit it on blur and before the form submits. */
 function flush(){if(inp.value.trim()){add(inp.value);inp.value='';}}
 inp.addEventListener('blur',flush);var fm=box.closest('form');if(fm)fm.addEventListener('submit',flush,true);
 if(hid&&hid.value&&!box.querySelector('.pb-tag'))hid.value.split(sep).forEach(function(x){add(x,true);});sync(false);}
function pbOtp(g){var ins=[].slice.call(g.querySelectorAll('input'));
 function done(){var v=ins.map(function(i){return i.value}).join('');var f=g.closest('.pb-field');if(v.length===ins.length){f&&f.setAttribute('data-valid','');pbEmit(g,'pb:complete',v);}else f&&f.removeAttribute('data-valid');}
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
 var fld=f.closest('.pb-field')||f;
 function set(h){if(!h&&!inp.required){fld.removeAttribute('data-invalid');sw.style.removeProperty('--c');pop.querySelectorAll('[data-hex]').forEach(function(b){b.setAttribute('aria-pressed','false')});return;}
  if(!/^#[0-9a-f]{6}$/i.test(h)){fld.setAttribute('data-invalid','');return;}fld.removeAttribute('data-invalid');h=h.toLowerCase();inp.value=h;sw.style.setProperty('--c',h);pop.querySelectorAll('[data-hex]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.hex===h)});}
 function place(){pbPlace(f,pop,{gap:6});}
 sw.addEventListener('click',function(){if(pop.matches(':popover-open'))return pop.hidePopover();set(inp.value);pop.showPopover();place();(pop.querySelector('[aria-pressed="true"]')||pop.querySelector('.pb-swatch')).focus();});
 pbOnDoc('scroll',f,function(){if(pop.matches(':popover-open'))place();});pbOnDoc('resize',f,function(){if(pop.matches(':popover-open'))place();});
 pop.addEventListener('click',function(e){var b=e.target.closest('[data-hex]');if(b){set(b.dataset.hex);pop.hidePopover();sw.focus();}});
 pop.querySelector('input[type=color]').addEventListener('input',function(e){set(e.target.value);});
 inp.addEventListener('change',function(){set(inp.value.trim().replace(/^([0-9a-f]{6})$/i,'#$1'));});set(inp.value);}
function pbCopied(b,ok){var lab=b.querySelector('span:not(.pb-icon)'),ic=b.querySelector('.pb-icon');var o1=lab&&lab.textContent,o2=ic&&ic.className,fb=pbStrings.copyFallback.replace('{key}',pbKey('mod+C'));
 if(lab)lab.textContent=ok?pbStrings.copied:fb;if(ic&&ok)ic.className='pb-icon pb-icon--check';if(ok)b.setAttribute('data-done','');if(b.dataset.tip!=null){var t0=b.dataset.tip;b.dataset.tip=ok?pbStrings.copied:fb;b.setAttribute('data-tip-open','');}
 pbAnnounce(ok?pbStrings.copied:fb);
 setTimeout(function(){if(lab)lab.textContent=o1;if(ic)ic.className=o2;b.removeAttribute('data-done');if(b.dataset.tip!=null){b.dataset.tip=t0;b.removeAttribute('data-tip-open');}},1600);}
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
/* Password strength: .pb-strength in the same .pb-field as the input. The built-in score counts length and mixed character kinds. Plug in your own:
   pbStrength.score = function(value, input){ return 0..4 or {level, label}; }, or listen for pb:strength on the meter (bubbles; detail
   {value, input, level, label}) and change detail.level or detail.label. Labels default to pbStrings.strength. */
function pbStrength(m){var f=m.closest('.pb-field'),i=f&&f.querySelector('input');if(!i)return;
 function up(){var v=i.value,r=(typeof pbStrength.score==='function'?pbStrength.score:pbStrengthScore)(v,i),lv=r&&typeof r==='object'?r.level:r,lab=r&&typeof r==='object'&&r.label!=null?r.label:null;
  lv=Math.max(0,Math.min(4,Math.round(+lv)||0));var d={value:v,input:i,level:lv,label:lab==null?pbStrings.strength[lv]:lab};pbEmit(m,'pb:strength',d);
  m.dataset.level=d.level;if(m.lastElementChild)m.lastElementChild.textContent=d.label;}
 i.addEventListener('input',up);m.pbUpdate=up;up();}
function pbRange(r){var o=r.closest('.pb-field').querySelector('output');function up(){var p=(r.value-r.min)/((r.max||100)-(r.min||0))*100;r.style.setProperty('--pct',p+'%');if(o)o.textContent=r.value+(o.textContent.indexOf('%')>-1?'%':'');}r.addEventListener('input',up);up();}
/* Tabs: .pb-tabs > .pb-tab[aria-controls] with roving tabindex, arrows, Home/End; fires pb:tabchange {tab, panel}.
   data-tab-hash (on .pb-tabs or on a tab) keeps the selected tab's panel id in the URL fragment and opens that tab on load and on hashchange.
   data-hides="<selector>" on a tab hides those elements while the tab is selected. */
function pbTabs(l){var tabs=[].slice.call(l.querySelectorAll('.pb-tab[aria-controls]')),panel=function(t){return document.getElementById(t.getAttribute('aria-controls'));};if(!tabs.length)return;
 var cur=tabs.filter(function(t){return t.getAttribute('aria-selected')==='true';})[0]||tabs[0];tabs.forEach(function(t){t.tabIndex=t===cur?0:-1;});
 function hashed(t){return l.hasAttribute('data-tab-hash')||t.hasAttribute('data-tab-hash');}
 function hides(t){var H=t.dataset.hides?[].slice.call(document.querySelectorAll(t.dataset.hides)):[];tabs.forEach(function(x){if(x.dataset.hides)document.querySelectorAll(x.dataset.hides).forEach(function(el){el.hidden=H.indexOf(el)>=0;});});}
 function pick(t,focus){if(focus)t.focus();if(t.getAttribute('aria-selected')==='true')return;tabs.forEach(function(x){x.setAttribute('aria-selected',x===t);x.tabIndex=x===t?0:-1;var p=panel(x);if(p)p.hidden=x!==t;});
  hides(t);if(hashed(t)){var h='#'+t.getAttribute('aria-controls');if(location.hash!==h)history.replaceState(history.state,'',h);}
  l.dispatchEvent(new CustomEvent('pb:tabchange',{bubbles:true,detail:{tab:t,panel:panel(t)}}));}
 function fromHash(){if(!l.isConnected||location.hash.length<2)return;var id=decodeURIComponent(location.hash.slice(1)),t=tabs.filter(function(x){return x.getAttribute('aria-controls')===id&&hashed(x);})[0];if(t)pick(t);}
 tabs.forEach(function(t,i){t.addEventListener('click',function(){pick(t);});
  t.addEventListener('keydown',function(e){var v=l.getAttribute('aria-orientation')==='vertical',n={ArrowRight:v?0:1,ArrowLeft:v?0:-1,ArrowDown:v?1:0,ArrowUp:v?-1:0}[e.key],j=null;
   if(n)j=(i+n+tabs.length)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;if(j==null)return;e.preventDefault();pick(tabs[j],true);});});
 hides(cur);if(tabs.some(hashed)){fromHash();window.addEventListener('hashchange',fromHash);}}
/* Form section save state. Snapshot on bind; input that differs → dirty (Discard and Save enabled), back to the snapshot or reset → clean; submit → busy.
   The host settles it: form.dispatchEvent(new CustomEvent('pb:saved')) or new CustomEvent('pb:error',{detail:{message}}). A server-rendered
   .pb-foot__status[data-state=saved|error] stays until the next input; a section holding [data-invalid] starts dirty. */
function pbSection(f){var form=f.elements?f:(f.querySelector('form')||f.closest('form'));if(!form)return;
 var st=f.querySelector('.pb-foot__status'),clean=st&&!st.dataset.state?st.textContent:pbStrings.noChanges,snap,busy=false;
 function ctrls(){return [].filter.call(form.elements,function(c){return !/^(BUTTON|FIELDSET|OUTPUT|OBJECT)$/.test(c.tagName)&&!/^(button|submit|reset|image)$/.test(c.type);});}
 function btns(){return [].filter.call(form.querySelectorAll('button,input[type=submit],input[type=reset]'),function(b){return !b.classList.contains('pb-btn--danger')&&(b.type==='submit'||b.type==='reset');});}
 function ser(){return JSON.stringify(ctrls().map(function(c){return c.type==='checkbox'||c.type==='radio'?c.checked:c.tagName==='SELECT'?[].map.call(c.options,function(o){return o.selected}):c.value;}));}
 function restore(){var v=JSON.parse(snap);ctrls().forEach(function(c,i){if(i>=v.length)return;if(c.type==='checkbox'||c.type==='radio')c.checked=v[i];else if(c.tagName==='SELECT')[].forEach.call(c.options,function(o,k){o.selected=!!v[i][k]});else if(c.type!=='file')c.value=v[i];});}
 function set(state,msg){var on=state==='dirty'||state==='error';btns().forEach(function(b){b.disabled=!on});if(!st)return;st.textContent=msg;
   if(state==='clean')st.removeAttribute('data-state');else st.dataset.state=state;
   var ic={saved:'status-ok',error:'status-down',busy:'refresh'}[state];if(ic){var i=document.createElement('span');i.className='pb-icon pb-icon--'+ic+(state==='busy'?' pb-icon--spin':'');st.prepend(i);}}
 function check(){if(ser()===snap)set('clean',clean);else set('dirty',pbStrings.unsaved);}
 snap=ser();if(form.querySelector('[data-invalid]'))set('dirty',pbStrings.unsaved);else{var s0=st&&st.dataset.state;btns().forEach(function(b){b.disabled=s0!=='error'&&s0!=='dirty';});}
 form.addEventListener('input',check);form.addEventListener('change',check);
 form.addEventListener('reset',function(){setTimeout(function(){restore();set('clean',clean);});});
 form.addEventListener('submit',function(e){if(e.pbInvalid&&e.pbInvalid.length)return;busy=true;set('busy',pbStrings.saving);});
 form.addEventListener('pb:saved',function(e){busy=false;snap=ser();set('saved',(e.detail&&e.detail.message)||pbStrings.savedNow);});
 form.addEventListener('pb:error',function(e){busy=false;set('error',(e.detail&&e.detail.message)||pbStrings.saveFailed);});
 /* Leaving with unsaved edits asks first (pbGuardUnload comes with the app patterns); a save in flight does not count. */
 var guard=typeof pbGuardUnload==='function'&&pbGuardUnload;if(guard)guard(form,function(){return !busy&&ser()!==snap;});
 f.pbSnapshot=function(){snap=ser();check();};}
function pbTableBasic(t){var body=t.tBodies[0];if(!body||t.closest('[data-dt],[data-bulk]:has(.pb-bulkbar)'))return;var wrap=t.closest('.pb-tablewrap'),all=t.querySelector('[data-all]'),rows=[].slice.call(body.rows),out=wrap&&wrap.querySelector('[data-selcount]');
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
/* Code area: a highlighted mirror (.pb-code__hl) under a transparent textarea, with a line gutter. The mirror follows typing, form reset and
   script writes to textarea.value, and el.pbSync() redraws it. Highlighting: pbCodeHL for data-lang="yaml" (or data-highlight), plain text
   otherwise; set pbCodeArea.highlight = function(text, lang, el){ return html or null } to plug in another highlighter (escape the text).
   A read-only block (no textarea) gets a Copy button unless it has data-nocopy or already holds a [data-copy] button. */
function pbCodeArea(c){var ta=c.querySelector('textarea'),h=c.querySelector('.pb-code__hl'),g=c.querySelector('.pb-code__gutter');if(!h)return;var lang=(c.dataset.lang||'').toLowerCase();
 function yaml(){return lang==='yaml'||c.hasAttribute('data-highlight');}
 function hl(t){var f=pbCodeArea.highlight;if(typeof f==='function'){var r=f(t,lang,c);if(r!=null)return r;}return yaml()?pbCodeHL(t):pbEsc(t)+'\n';}
 if(!ta){if(!h.children.length&&(yaml()||typeof pbCodeArea.highlight==='function')){h.innerHTML=hl(h.textContent);pbStyled(h);}
  if(!c.hasAttribute('data-nocopy')&&!c.querySelector('[data-copy],[data-copy-target],[data-copy-text]')){if(!h.id)h.id=pbId('pb-code');var b=document.createElement('button');b.type='button';b.className='pb-btn pb-btn--ghost pb-btn--sm pb-code__copy';
   b.setAttribute('data-copy-target','#'+h.id);b.innerHTML='<span class="pb-icon pb-icon--copy"></span><span>'+pbEsc(pbStrings.copy)+'</span>';var bar=c.querySelector('.pb-code__bar');if(bar)bar.appendChild(b);else{c.classList.add('pb-code--copy');c.prepend(b);}pbInit(b,{only:'copy'});}
  return;}
 function up(){var v=ta.value;h.innerHTML=hl(v);pbStyled(h);if(g)g.textContent=v.split('\n').map(function(_,i){return i+1}).join('\n');}
 var P=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value');
 try{Object.defineProperty(ta,'value',{configurable:true,get:function(){return P.get.call(ta);},set:function(v){P.set.call(ta,v);up();}});}catch(e){}
 ta.addEventListener('input',up);if(ta.form)ta.form.addEventListener('reset',function(){setTimeout(up);});c.pbSync=up;up();}
/* .pb-progress[data-value="0..100"] sets --value for the bar inside; el.pbSet(v) updates it. */
function pbProgress(p){function set(v){var n=parseFloat(v);if(isNaN(n))return;p.style.setProperty('--value',Math.max(0,Math.min(100,n))+'%');p.setAttribute('data-value',n);}p.pbSet=set;set(p.getAttribute('data-value'));}
/* [data-dismiss] removes its .pb-sitebar, .pb-notice or .pb-toast; focus moves to the next focusable thing (pbFocusNear) instead of being lost. */
function pbDismiss(b){b.addEventListener('click',function(){var s=b.closest('.pb-sitebar,.pb-notice,.pb-toast');if(!s)return;pbFocusNear(s);s.remove();});}

function pbStrengthScore(v){var s=0;if(!v)return 0;if(v.length>=8)s++;if(v.length>=12)s++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))s++;if(/[\d\W_]/.test(v))s++;return Math.max(1,s);}